import redis as r
from typing import Optional, Any

redis = r.Redis(connection_pool=r.ConnectionPool(host='localhost', port=6379, db=0))

def rget(key: str, *, game_id: Optional[str]) -> Optional[str]:
    key = f'magic:{key}'
    if game_id is None:
        raw_result = redis.get(key)
    else:
        raw_result = redis.get(f'{key}:{game_id}')
    return raw_result.decode('utf-8') if raw_result is not None else None

def rset(key: str, value: Any, *, game_id: Optional[str], ex: Optional[int] = 86400) -> None:
    key = f'magic:{key}'
    if game_id is None:
        redis.set(key, value, ex=ex)    
    else:
        redis.set(f'{key}:{game_id}', value, ex=ex)
