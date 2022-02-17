pnpm install

rm .npmrc  && mv ./deploy/private.npmrc ./.npmrc

pnpm run publish



