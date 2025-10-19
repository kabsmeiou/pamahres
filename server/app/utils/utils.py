
from typing import Any


def get_data_from_request(request, key: str, default: Any = None) -> Any:
    data = request.data.get(key, default)
    if data is None:
        raise ValueError(f"Missing required parameter: {key}")
    return data