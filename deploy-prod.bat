@echo off
echo Deploying to Production (https://grandiose-swordfish-144.convex.cloud)...
npx convex deploy --env-file .env.production --typecheck=disable
echo Deployment complete!
