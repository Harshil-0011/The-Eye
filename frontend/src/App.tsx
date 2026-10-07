import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { TopBar } from './components/TopBar';
import { DetailPanel } from './components/DetailPanel';
import { GraphExplorer } from './components/GraphExplorer';
import { TimelineView } from './components/TimelineView';
import { SearchView } from './pages/SearchView';
import { EntitiesView } from './pages/EntitiesView';
import { DocumentsView } from './pages/DocumentsView';
import { ReviewQueueView } from './pages/ReviewQueueView';
import { SourcesView } from './pages/SourcesView';
import { GraphNode, GraphData, SearchResponse, Entity, MergeRecord, Source, Document } from './types';
import {
  fetchGraphData,
  fetchNeighborGraph,
  searchGlobal,
  fetchEntities,
  fetchDocuments,
  fetchReviewQueue,
  fetchSources,
  acceptMerge,
  rejectMerge,
  deleteEntity
} from './services/api';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('graph');
  const [globalQuery, setGlobalQuery] = useState<string>('');

  const [graphData, setGraphData] = useState<GraphData>({ nodes: [], edges: [] });
  const [searchData, setSearchData] = useState<SearchResponse | null>(null);
  const [entities, setEntities] = useState<Entity[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [reviewRecords, setReviewRecords] = useState<MergeRecord[]>([]);
  const [sources, setSources] = useState<Source[]>([]);

  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);

  const loadData = async () => {
    try {
      const [gData, ents, docs, reviews, srcs] = await Promise.all([
        fetchGraphData(),
        fetchEntities(),
        fetchDocuments(),
        fetchReviewQueue('PROPOSED'),
        fetchSources(),
      ]);
      setGraphData(gData);
      setEntities(ents);
      setDocuments(docs);
      setReviewRecords(reviews);
      setSources(srcs);
    } catch (err) {
      console.error('Error fetching system data', err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSearchSubmit = async () => {
    if (!globalQuery.trim()) return;
    try {
      const res = await searchGlobal(globalQuery);
      setSearchData(res);
      setActiveTab('search');
    } catch (err) {
      console.error('Search failed', err);
    }
  };

  const handleExpandNeighbors = async (nodeId: string) => {
    try {
      const expanded = await fetchNeighborGraph(nodeId, 2);
      setGraphData(expanded);
    } catch (err) {
      console.error('Error expanding neighbors', err);
    }
  };

  const handleDeleteEntity = async (id: string) => {
    try {
      await deleteEntity(id);
      setSelectedNode(null);
      await loadData();
    } catch (err) {
      alert('Delete failed');
    }
  };

  const handleAcceptMerge = async (mergeId: string) => {
    await acceptMerge(mergeId);
    await loadData();
  };

  const handleRejectMerge = async (mergeId: string) => {
    await rejectMerge(mergeId);
    await loadData();
  };

  return (
    <div className="flex h-screen bg-[#0A0E14] text-white font-inter overflow-hidden">
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        pendingReviewCount={reviewRecords.length}
      />

      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <TopBar
          globalQuery={globalQuery}
          setGlobalQuery={setGlobalQuery}
          onSearchSubmit={handleSearchSubmit}
        />

        <main className="flex-1 flex relative overflow-hidden bg-[#0A0E14]">
          <div className="flex-1 overflow-y-auto p-6">
            {activeTab === 'search' && (
              <SearchView
                searchData={searchData}
                onSelectResult={(card) => {
                  if (card.object_type === 'entity') {
                    const node = graphData.nodes.find((n) => n.id === card.id);
                    if (node) setSelectedNode(node);
                  }
                }}
                onSearch={(q) => {
                  setGlobalQuery(q);
                  handleSearchSubmit();
                }}
              />
            )}

            {activeTab === 'graph' && (
              <div className="h-[82vh]">
                <GraphExplorer
                  graphData={graphData}
                  onNodeSelect={(node) => setSelectedNode(node)}
                  selectedNodeId={selectedNode?.id}
                  onExpandNeighbors={handleExpandNeighbors}
                />
              </div>
            )}

            {activeTab === 'timeline' && (
              <TimelineView />
            )}

            {activeTab === 'entities' && (
              <EntitiesView entities={entities} onDeleteEntity={handleDeleteEntity} />
            )}

            {activeTab === 'documents' && (
              <DocumentsView documents={documents} />
            )}

            {activeTab === 'review' && (
              <ReviewQueueView
                records={reviewRecords}
                onAccept={handleAcceptMerge}
                onReject={handleRejectMerge}
              />
            )}

            {activeTab === 'sources' && (
              <SourcesView sources={sources} onUploadSuccess={loadData} />
            )}

            {activeTab === 'analytics' && (
              <div className="glass-panel p-8 rounded-xl space-y-6">
                <h2 className="text-2xl font-bold font-grotesk text-[#38BDF8]">System Intelligence Analytics</h2>
                <div className="grid grid-cols-4 gap-4 text-center">
                  <div className="glass-card p-4 rounded-xl">
                    <p className="text-xs text-[#8B98AB] font-mono">Entities</p>
                    <p className="text-2xl font-bold font-grotesk text-white">{entities.length}</p>
                  </div>
                  <div className="glass-card p-4 rounded-xl">
                    <p className="text-xs text-[#8B98AB] font-mono">Edges</p>
                    <p className="text-2xl font-bold font-grotesk text-white">{graphData.edges.length}</p>
                  </div>
                  <div className="glass-card p-4 rounded-xl">
                    <p className="text-xs text-[#8B98AB] font-mono">Sources</p>
                    <p className="text-2xl font-bold font-grotesk text-white">{sources.length}</p>
                  </div>
                  <div className="glass-card p-4 rounded-xl">
                    <p className="text-xs text-[#8B98AB] font-mono">Review Queue</p>
                    <p className="text-2xl font-bold font-grotesk text-amber-400">{reviewRecords.length}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <DetailPanel
            selectedNode={selectedNode}
            onClose={() => setSelectedNode(null)}
            onDelete={handleDeleteEntity}
          />
        </main>
      </div>
    </div>
  );
}
