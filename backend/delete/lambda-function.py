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
        # Get logged-in user's Cognito information
        claims = event["requestContext"]["authorizer"]["jwt"]["claims"]
        user_id = claims["sub"]

        # Get filename from request body
        body = json.loads(event.get("body", "{}"))
        filename = body.get("filename")

        if not filename:
            return {
                "statusCode": 400,
                "headers": {
                    "Content-Type": "application/json"
                },
                "body": json.dumps({
                    "error": "Filename is required"
                })
            }

        # Build user-specific S3 key
        object_key = f"{user_id}/{filename}"

        # Delete the object
        s3.delete_object(
            Bucket=BUCKET_NAME,
            Key=object_key
        )

        return {
            "statusCode": 200,
            "headers": {
                "Content-Type": "application/json"
            },
            "body": json.dumps({
                "message": "File deleted successfully",
                "filename": filename
            })
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