import httpx
import logging
from typing import Optional, List
import config

logger = logging.getLogger(__name__)

async def send_product_webhook(
    product_id: int,
    name: str,
    description: Optional[str],
    product_type: str,
    service_department: Optional[str]
) -> dict:
    if not config.TASKFLOW_WEBHOOKS_ENABLED:
        logger.info(f"Webhooks disabled, skipping product.in_development for product {product_id}")
        return {"success": False, "reason": "webhooks_disabled"}

    url = f"{config.TASKFLOW_WEBHOOK_URL}/product"
    payload = {
        "event": "product.in_development",
        "product_id": product_id,
        "name": name,
        "description": description,
        "product_type": "product",
        "is_internal": product_type == "Internal",
        "service_department": service_department
    }
    headers = {
        "Content-Type": "application/json",
        "X-Webhook-Secret": config.TASKFLOW_WEBHOOK_SECRET
    }

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.post(url, json=payload, headers=headers)

            if response.status_code == 201:
                data = response.json()
                logger.info(f"Webhook sent successfully for product {product_id}, TF project_id={data.get('project_id')}")
                return {"success": True, "project_id": data.get("project_id")}
            else:
                logger.error(f"Webhook failed for product {product_id}: {response.status_code} - {response.text}")
                return {"success": False, "status_code": response.status_code, "error": response.text}
    except httpx.TimeoutException:
        logger.error(f"Webhook timeout for product {product_id}")
        return {"success": False, "error": "timeout"}
    except httpx.RequestError as e:
        logger.error(f"Webhook request error for product {product_id}: {e}")
        return {"success": False, "error": str(e)}


async def send_service_webhook(
    service_id: int,
    name: str,
    description: Optional[str],
    department_name: str,
    business_unit: str
) -> dict:
    if not config.TASKFLOW_WEBHOOKS_ENABLED:
        logger.info(f"Webhooks disabled, skipping service.created for service {service_id}")
        return {"success": False, "reason": "webhooks_disabled"}

    url = f"{config.TASKFLOW_WEBHOOK_URL}/service"
    payload = {
        "event": "service.created",
        "service_id": service_id,
        "name": name,
        "description": description,
        "department_name": department_name,
        "business_unit": business_unit
    }
    headers = {
        "Content-Type": "application/json",
        "X-Webhook-Secret": config.TASKFLOW_WEBHOOK_SECRET
    }

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.post(url, json=payload, headers=headers)

            if response.status_code == 201:
                data = response.json()
                logger.info(f"Webhook sent successfully for service {service_id}, TF project_id={data.get('project_id')}")
                return {"success": True, "project_id": data.get("project_id")}
            else:
                logger.error(f"Webhook failed for service {service_id}: {response.status_code} - {response.text}")
                return {"success": False, "status_code": response.status_code, "error": response.text}
    except httpx.TimeoutException:
        logger.error(f"Webhook timeout for service {service_id}")
        return {"success": False, "error": "timeout"}
    except httpx.RequestError as e:
        logger.error(f"Webhook request error for service {service_id}: {e}")
        return {"success": False, "error": str(e)}


async def send_department_webhook(
    department_id: int,
    name: str,
    event: str,
    manager_name: Optional[str] = None,
    positions: Optional[List[dict]] = None
) -> dict:
    if not config.TASKFLOW_WEBHOOKS_ENABLED:
        logger.info(f"Webhooks disabled, skipping {event} for department {department_id}")
        return {"success": False, "reason": "webhooks_disabled"}

    url = f"{config.TASKFLOW_WEBHOOK_URL}/department"
    payload = {
        "event": event,
        "department_id": department_id,
        "name": name,
        "manager_name": manager_name,
        "positions": positions or []
    }
    headers = {
        "Content-Type": "application/json",
        "X-Webhook-Secret": config.TASKFLOW_WEBHOOK_SECRET
    }

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.post(url, json=payload, headers=headers)

            if response.status_code == 201:
                data = response.json()
                logger.info(f"Department webhook sent successfully for department {department_id}")
                return {"success": True, "data": data}
            else:
                logger.error(f"Department webhook failed for department {department_id}: {response.status_code} - {response.text}")
                return {"success": False, "status_code": response.status_code, "error": response.text}
    except httpx.TimeoutException:
        logger.error(f"Department webhook timeout for department {department_id}")
        return {"success": False, "error": "timeout"}
    except httpx.RequestError as e:
        logger.error(f"Department webhook request error for department {department_id}: {e}")
        return {"success": False, "error": str(e)}


async def send_position_webhook(
    position_id: int,
    name: str,
    department_id: int,
    event: str
) -> dict:
    if not config.TASKFLOW_WEBHOOKS_ENABLED:
        logger.info(f"Webhooks disabled, skipping {event} for position {position_id}")
        return {"success": False, "reason": "webhooks_disabled"}

    url = f"{config.TASKFLOW_WEBHOOK_URL}/position"
    payload = {
        "event": event,
        "position_id": position_id,
        "name": name,
        "department_id": department_id
    }
    headers = {
        "Content-Type": "application/json",
        "X-Webhook-Secret": config.TASKFLOW_WEBHOOK_SECRET
    }

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.post(url, json=payload, headers=headers)

            if response.status_code == 201:
                data = response.json()
                logger.info(f"Position webhook sent successfully for position {position_id}")
                return {"success": True, "data": data}
            else:
                logger.error(f"Position webhook failed for position {position_id}: {response.status_code} - {response.text}")
                return {"success": False, "status_code": response.status_code, "error": response.text}
    except httpx.TimeoutException:
        logger.error(f"Position webhook timeout for position {position_id}")
        return {"success": False, "error": "timeout"}
    except httpx.RequestError as e:
        logger.error(f"Position webhook request error for position {position_id}: {e}")
        return {"success": False, "error": str(e)}


async def send_business_unit_webhook(
    business_unit_id: int,
    name: str,
    event: str,
    description: Optional[str] = None,
    head_position_id: Optional[int] = None
) -> dict:
    if not config.TASKFLOW_WEBHOOKS_ENABLED:
        logger.info(f"Webhooks disabled, skipping {event} for business unit {business_unit_id}")
        return {"success": False, "reason": "webhooks_disabled"}

    url = f"{config.TASKFLOW_WEBHOOK_URL}/business-unit"
    payload = {
        "event": event,
        "business_unit_id": business_unit_id,
        "name": name,
        "description": description,
        "head_position_id": head_position_id
    }
    headers = {
        "Content-Type": "application/json",
        "X-Webhook-Secret": config.TASKFLOW_WEBHOOK_SECRET
    }

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.post(url, json=payload, headers=headers)

            if response.status_code == 201:
                data = response.json()
                logger.info(f"Business unit webhook sent successfully for BU {business_unit_id}")
                return {"success": True, "data": data}
            else:
                logger.error(f"Business unit webhook failed for BU {business_unit_id}: {response.status_code} - {response.text}")
                return {"success": False, "status_code": response.status_code, "error": response.text}
    except httpx.TimeoutException:
        logger.error(f"Business unit webhook timeout for BU {business_unit_id}")
        return {"success": False, "error": "timeout"}
    except httpx.RequestError as e:
        logger.error(f"Business unit webhook request error for BU {business_unit_id}: {e}")
        return {"success": False, "error": str(e)}


async def send_business_unit_team_webhook(
    business_unit_id: int,
    positions: List[dict]
) -> dict:
    if not config.TASKFLOW_WEBHOOKS_ENABLED:
        logger.info(f"Webhooks disabled, skipping business_unit_team.updated for BU {business_unit_id}")
        return {"success": False, "reason": "webhooks_disabled"}

    url = f"{config.TASKFLOW_WEBHOOK_URL}/business-unit-team"
    payload = {
        "event": "business_unit_team.updated",
        "business_unit_id": business_unit_id,
        "positions": positions
    }
    headers = {
        "Content-Type": "application/json",
        "X-Webhook-Secret": config.TASKFLOW_WEBHOOK_SECRET
    }

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.post(url, json=payload, headers=headers)

            if response.status_code == 201:
                data = response.json()
                logger.info(f"Business unit team webhook sent successfully for BU {business_unit_id}")
                return {"success": True, "data": data}
            else:
                logger.error(f"Business unit team webhook failed for BU {business_unit_id}: {response.status_code} - {response.text}")
                return {"success": False, "status_code": response.status_code, "error": response.text}
    except httpx.TimeoutException:
        logger.error(f"Business unit team webhook timeout for BU {business_unit_id}")
        return {"success": False, "error": "timeout"}
    except httpx.RequestError as e:
        logger.error(f"Business unit team webhook request error for BU {business_unit_id}: {e}")
        return {"success": False, "error": str(e)}
