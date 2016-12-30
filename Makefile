NODE_MODULES_DIR = node_modules
BOWER_DIR = bower_components

$(NODE_MODULES_DIR): package.json
	@docker run --rm \
		-v $(CURDIR):/data \
		-w /data \
		node:6.6.0 \
		npm install

$(BOWER_DIR): bower.json
	@docker run --rm \
		-v $(CURDIR):/data \
		-w /data \
		node:6.6.0 \
		node_modules/.bin/bower install --allow-root

dep: $(NODE_MODULES_DIR) $(BOWER_DIR)

start: dep
	@docker run --rm -it \
		-v $(CURDIR):/data \
		-w /data \
		-p 9020:9020 \
		node:6.6.0 \
		npm run start

build: dep
	@docker run --rm -it \
		-v $(CURDIR):/data \
		-w /data \
		-p 9020:9020 \
		node:6.6.0 \
		npm run build
