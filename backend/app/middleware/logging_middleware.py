from fastapi import Request
import time
from app.services.logging_service import LoggingService

logging_service = LoggingService()

async def logging_middleware(request: Request, call_next):
    start_time = time.time()
    
    try:
        response = await call_next(request)
        execution_time = time.time() - start_time
        
        # Get user email from request state (set during authentication)
        user_email = getattr(request.state, "user_email", "anonymous")
        
        await logging_service.log_request(
            request=request,
            user_email=user_email,
            status_code=response.status_code,
            execution_time=execution_time
        )
        
        return response
        
    except Exception as e:
        execution_time = time.time() - start_time
        
        await logging_service.log_request(
            request=request,
            user_email=getattr(request.state, "user_email", "anonymous"),
            status_code=500,
            execution_time=execution_time,
            error_message=str(e)
        )
        raise 