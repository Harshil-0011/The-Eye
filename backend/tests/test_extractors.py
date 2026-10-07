import json
from backend.app.services.extractors import FileExtractor, SchemaMapper

def test_extract_csv():
    csv_data = b"name,role,email\nAlice,Engineer,alice@example.com\nBob,Analyst,bob@example.com"
    records = FileExtractor.extract_csv(csv_data)
    assert len(records) == 2
    assert records[0]["name"] == "Alice"
    assert records[1]["role"] == "Analyst"

def test_extract_json():
    json_data = json.dumps([{"title": "Event 1", "date": "2024-01-01"}, {"title": "Event 2", "date": "2024-01-02"}]).encode('utf-8')
    records = FileExtractor.extract_json(json_data)
    assert len(records) == 2
    assert records[0]["title"] == "Event 1"

def test_schema_mapper_inference_and_mapping():
    sample_records = [{"full_name": "Carol Danvers", "job_title": "Captain", "org_name": "Starforce"}]
    inferred = SchemaMapper.infer_column_types(sample_records)
    assert "full_name" in inferred
    assert inferred["full_name"] == "entity_name"

    mapping = {"full_name": "entity_name", "job_title": "property"}
    entities, events = SchemaMapper.map_record_to_canonical(sample_records[0], mapping)
    assert len(entities) == 1
    assert entities[0]["name"] == "Carol Danvers"
    assert entities[0]["properties"]["job_title"] == "Captain"
