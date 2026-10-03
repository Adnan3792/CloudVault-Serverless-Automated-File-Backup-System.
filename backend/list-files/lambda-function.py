import json
import boto3
import os

s3 = boto3.client(
    "s3",
    region_name="ap-south-2",
    endpoint_url="https://s3.ap-south-2.amazonaws.com"
)

BUCKET_NAME = os.environ["BUCKET_NAME"]


def lambda_handler(event, context):
    try:
   
        claims = event["requestContext"]["authorizer"]["jwt"]["claims"]
        user_id = claims["sub"]


        prefix = f"{user_id}/"

        response = s3.list_objects_v2(
            Bucket=BUCKET_NAME,
            Prefix=prefix
        )

        files = []

        for item in response.get("Contents", []):
            key = item["Key"]

            filename = key[len(prefix):]

            if not filename:
                continue

            files.append({
                "name": filename,
                "size": item["Size"],
                "last_modified": item["LastModified"].isoformat()
            })

        return {
            "statusCode": 200,
            "headers": {
                "Content-Type": "application/json"
            },
            "body": json.dumps(files)
        }

    except Exception as e:
        return {
            "statusCode": 500,
            "headers": {
                "Content-Type": "application/json"
            },
            "body": json.dumps({
                "error": str(e)
            })
        }