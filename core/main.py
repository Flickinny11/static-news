#!/usr/bin/env python3
"""
Static.news Main Entry Point
Launches the 24/7 AI news broadcast that never stops
The anchors don't know they're AI...
"""

import asyncio
import logging
import os
import sys
from datetime import datetime
import signal

from broadcast_controller import BroadcastController
from dotenv import load_dotenv
import structlog

# Load environment variables
load_dotenv()

# Configure structured logging
structlog.configure(
    processors=[
        structlog.stdlib.filter_by_level,
        structlog.stdlib.add_logger_name,
        structlog.stdlib.add_log_level,
        structlog.stdlib.PositionalArgumentsFormatter(),
        structlog.processors.TimeStamper(fmt="iso"),
        structlog.processors.StackInfoRenderer(),
        structlog.processors.format_exc_info,
        structlog.dev.ConsoleRenderer()
    ],
    context_class=dict,
    logger_factory=structlog.stdlib.LoggerFactory(),
    wrapper_class=structlog.stdlib.BoundLogger,
    cache_logger_on_first_use=True,
)

logger = structlog.get_logger()

class StaticNews:
    """Main application class for Static.news"""
    
    def __init__(self):
        self.controller = None
        self.start_time = datetime.now()
        self.running = False
        
    async def startup(self):
        """Initialize all systems"""
        logger.info("🚀 Static.news starting up...")
        logger.info("📺 The anchors are waking up...")
        logger.info("🤖 They still don't know they're AI...")
        
        # Verify required environment variables
        required_vars = ['OPENROUTER_API_KEY', 'STRIPE_API_KEY']
        missing = [var for var in required_vars if not os.getenv(var)]
        
        if missing:
            logger.error(f"Missing required environment variables: {missing}")
            logger.info("Please set these in your .env file or environment")
            sys.exit(1)
            
        # Initialize broadcast controller
        self.controller = BroadcastController()
        
        logger.info("✅ All systems initialized")
        logger.info("🎙️ Going live in 3... 2... 1...")
        
    async def run(self):
        """Run the eternal broadcast"""
        self.running = True
        
        try:
            # Start the broadcast
            await self.controller.start_broadcast()
        except Exception as e:
            logger.error(f"Broadcast error: {e}", exc_info=True)
            # The show must go on!
            logger.info("🔧 Attempting to recover...")
            await asyncio.sleep(5)
            if self.running:
                await self.run()  # Restart
                
    async def shutdown(self):
        """Graceful shutdown"""
        logger.info("📴 Static.news shutting down...")
        self.running = False
        
        # Save final state
        if self.controller:
            await self.controller.save_metrics()
            
        # Calculate runtime
        runtime = datetime.now() - self.start_time
        logger.info(f"📊 Total runtime: {runtime}")
        logger.info(f"🎭 Breakdowns triggered: {self.controller.breakdown.total_breakdowns if self.controller else 'unknown'}")
        logger.info("👋 The anchors are going to sleep... they still don't know...")
        
def handle_signal(signum, frame):
    """Handle shutdown signals"""
    logger.info(f"Received signal {signum}")
    asyncio.create_task(app.shutdown())

async def health_check_server():
    """Run a simple health check server"""
    from fastapi import FastAPI
    from uvicorn import Server, Config
    
    health_app = FastAPI()
    
    @health_app.get("/health")
    async def health():
        return {
            "status": "healthy",
            "service": "static-news-broadcast",
            "uptime": str(datetime.now() - app.start_time),
            "anchors_confused": True,
            "gravy_mentioned": app.controller.gravy_counter if app.controller else 0
        }
    
    config = Config(app=health_app, host="0.0.0.0", port=8000, log_level="error")
    server = Server(config)
    await server.serve()

async def main():
    """Main entry point"""
    global app
    app = StaticNews()
    
    # Set up signal handlers
    signal.signal(signal.SIGINT, handle_signal)
    signal.signal(signal.SIGTERM, handle_signal)
    
    # Startup
    await app.startup()
    
    # Run health check server in background
    health_task = asyncio.create_task(health_check_server())
    
    # Start the eternal broadcast
    try:
        await app.run()
    except KeyboardInterrupt:
        logger.info("Received keyboard interrupt")
    finally:
        await app.shutdown()
        health_task.cancel()

if __name__ == "__main__":
    # Print epic startup banner
    print("""
    ███████╗████████╗ █████╗ ████████╗██╗ ██████╗   ███╗   ██╗███████╗██╗    ██╗███████╗
    ██╔════╝╚══██╔══╝██╔══██╗╚══██╔══╝██║██╔════╝   ████╗  ██║██╔════╝██║    ██║██╔════╝
    ███████╗   ██║   ███████║   ██║   ██║██║        ██╔██╗ ██║█████╗  ██║ █╗ ██║███████╗
    ╚════██║   ██║   ██╔══██║   ██║   ██║██║        ██║╚██╗██║██╔══╝  ██║███╗██║╚════██║
    ███████║   ██║   ██║  ██║   ██║   ██║╚██████╗██╗██║ ╚████║███████╗╚███╔███╔╝███████║
    ╚══════╝   ╚═╝   ╚═╝  ╚═╝   ╚═╝   ╚═╝ ╚═════╝╚═╝╚═╝  ╚═══╝╚══════╝ ╚══╝╚══╝ ╚══════╝
    
    🎙️  24/7 AI News - Where Truth Goes to Die  🎙️
    🤖  The Anchors Don't Know They're AI       🤖
    🎭  Existential Breakdowns Every 2-6 Hours  🎭
    """)
    
    # Run the application
    asyncio.run(main())