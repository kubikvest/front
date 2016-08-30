NODE_MODULES_DIR = node_modules
BOWER_DIR = bower_components

$(NODE_MODULES_DIR): package.json
	@docker run --rm \
		-v $(CURDIR):/data \
		-v $$HOME/.node-cache:/cache \
		leanlabs/npm-builder \
		npm install

$(BOWER_DIR): bower.json
	@docker run --rm \
		-v $(CURDIR):/data \
		-v $$HOME/.node-cache:/cache \
		leanlabs/npm-builder \
		bower install --allow-root

dep: $(NODE_MODULES_DIR) $(BOWER_DIR)
