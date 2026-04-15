from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.routers import (
    actions,
    auth,
    users,
    accounts,
    products,
    orders,
    categories,
    reports,
    stores,
    settings as settings_router,
    templates_mgmt,
    templates,
    marketing,
    shipping,
    wholesale,
    master_list,
    mainpage,
    admin_tools,
    tax,
    store_features,
    store_changelog,
    store_settings,
    store_domain,
)

app = FastAPI(
    title="ColorCommerce Admin API",
    description="E-commerce Admin Platform API",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(actions.router, prefix=settings.API_PREFIX)
app.include_router(auth.router, prefix=settings.API_PREFIX)
app.include_router(users.router, prefix=settings.API_PREFIX)
app.include_router(accounts.router, prefix=settings.API_PREFIX)
app.include_router(products.router, prefix=settings.API_PREFIX)
app.include_router(orders.router, prefix=settings.API_PREFIX)
app.include_router(categories.router, prefix=settings.API_PREFIX)
app.include_router(reports.router, prefix=settings.API_PREFIX)
app.include_router(stores.router, prefix=settings.API_PREFIX)
app.include_router(settings_router.router, prefix=settings.API_PREFIX)
app.include_router(templates_mgmt.router, prefix=settings.API_PREFIX)
app.include_router(templates.router, prefix=settings.API_PREFIX)
app.include_router(marketing.router, prefix=settings.API_PREFIX)
app.include_router(shipping.router, prefix=settings.API_PREFIX)
app.include_router(wholesale.router, prefix=settings.API_PREFIX)
app.include_router(master_list.router, prefix=settings.API_PREFIX)
app.include_router(mainpage.router, prefix=settings.API_PREFIX)
app.include_router(admin_tools.router, prefix=settings.API_PREFIX)
app.include_router(tax.router, prefix=settings.API_PREFIX)
app.include_router(store_features.router, prefix=settings.API_PREFIX)
app.include_router(store_changelog.router, prefix=settings.API_PREFIX)
app.include_router(store_settings.router, prefix=settings.API_PREFIX)
app.include_router(store_domain.router, prefix=settings.API_PREFIX)


@app.get("/")
def read_root():
    return {
        "message": "ColorCommerce Admin API",
        "version": "1.0.0",
        "docs": "/docs",
        "redoc": "/redoc",
    }


@app.get("/health")
def health_check():
    return {"status": "healthy"}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
