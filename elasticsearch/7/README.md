# ElasticSearch 7 Plugin

- register restful handler

### build

run `mvn clean package` to get plugin zip file in `target/release/xxxx.zip`

### deploy

run `elasticsearch-plugin install file:/path/to/xxxx.zip`

```
NB: if it is told `jar hell`, unzip the `xxxx.zip`
    pick only the plugin xxxx.jar and plugin descriptor file
    zip the 2 files into `xxxx-new.zip`; then install the new zip

alternavitely, fix this problem in pom.xml.
```

### verify

run `curl http://127.0.0.1:9200/_print`
