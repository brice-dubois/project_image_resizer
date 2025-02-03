from google.cloud import bigquery
from datetime import datetime
import time
from fastapi import Request
from typing import Optional
from app.core.config import settings
import os
from pathlib import Path

class LoggingService:
    def __init__(self):
        # Convert relative path to absolute path
        credentials_path = Path(settings.GOOGLE_APPLICATION_CREDENTIALS).resolve()
        
        if not credentials_path.exists():
            raise FileNotFoundError(f"Credentials file not found at: {credentials_path}")
            
        os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = str(credentials_path)
        
        try:
            self.client = bigquery.Client(project=settings.PROJECT_ID)
            self.table_id = f"{settings.PROJECT_ID}.{settings.DATASET_ID}.{settings.TABLE_ID}"
            # Ensure the dataset and table exist
            self._ensure_table_exists()
        except Exception as e:
            print(f"Error initializing BigQuery client: {str(e)}")
            raise

    def _ensure_table_exists(self):
        """Create dataset and table if they don't exist"""
        try:
            dataset_ref = self.client.dataset(settings.DATASET_ID)
            try:
                self.client.get_dataset(dataset_ref)
            except Exception:
                # Dataset doesn't exist, create it
                dataset = bigquery.Dataset(dataset_ref)
                dataset.location = "US"  # Specify the location
                self.client.create_dataset(dataset)

            # Define table schema
            schema = [
                bigquery.SchemaField("datetime", "TIMESTAMP"),
                bigquery.SchemaField("user_email", "STRING"),
                bigquery.SchemaField("user_ip", "STRING"),
                bigquery.SchemaField("endpoint", "STRING"),
                bigquery.SchemaField("method", "STRING"),
                bigquery.SchemaField("status_code", "INTEGER"),
                bigquery.SchemaField("execution_time", "FLOAT"),
                bigquery.SchemaField("error_message", "STRING"),
                bigquery.SchemaField("task", "STRING"),
                bigquery.SchemaField("tool_url", "STRING")
            ]

            # Create table if it doesn't exist
            table_ref = dataset_ref.table(settings.TABLE_ID)
            try:
                self.client.get_table(table_ref)
            except Exception:
                table = bigquery.Table(table_ref, schema=schema)
                self.client.create_table(table)

        except Exception as e:
            print(f"Error setting up BigQuery: {str(e)}")

    async def log_request(
        self,
        request: Request,
        user_email: str,
        status_code: int,
        execution_time: float,
        error_message: Optional[str] = None,
        task: Optional[str] = None,
        tool_url: Optional[str] = None
    ):
        try:
            rows_to_insert = [{
                "datetime": datetime.utcnow(),
                "user_email": user_email,
                "user_ip": request.client.host,
                "endpoint": str(request.url.path),
                "method": request.method,
                "status_code": status_code,
                "execution_time": execution_time,
                "error_message": error_message or "",
                "task": task or "",
                "tool_url": tool_url or str(request.base_url)
            }]

            errors = self.client.insert_rows_json(self.table_id, rows_to_insert)
            if errors:
                print(f"Errors inserting rows: {errors}")
        except Exception as e:
            print(f"Error logging to BigQuery: {str(e)}") 