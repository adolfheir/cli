yarn config set registry $NPM_REGISTER

yarn cache clean

yarn

node ./deploy/npmLogin.js

yarn run publish

# while true; do echo houqi-web; sleep 1; done


