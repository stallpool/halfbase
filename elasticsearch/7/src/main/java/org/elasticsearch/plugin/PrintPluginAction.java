package org.elasticsearch.plugin;
 
import java.io.IOException;
import java.util.Date;
import java.util.List;
import java.util.ArrayList;
 
import org.elasticsearch.client.node.NodeClient;
import org.elasticsearch.common.inject.Inject;
import org.elasticsearch.common.settings.Settings;
import org.elasticsearch.common.xcontent.XContentBuilder;
import org.elasticsearch.rest.BaseRestHandler;
import org.elasticsearch.rest.BytesRestResponse;
import org.elasticsearch.rest.RestRequest;
import org.elasticsearch.rest.RestStatus;

// ref: https://github.com/elastic/elasticsearch/blob/master/plugins/examples/rest-handler/src/main/java/org/elasticsearch/example/resthandler/ExampleCatAction.java
// ref: https://github.com/elastic/elasticsearch/blob/master/server/src/main/java/org/elasticsearch/rest/action/search/RestSearchScrollAction.java
// ref: https://github.com/elastic/elasticsearch/blob/master/server/src/main/java/org/elasticsearch/rest/action/search/RestSearchAction.java

public class PrintPluginAction extends BaseRestHandler {
    private static String pluginName = "elasticsearch-plugin-example";

    @Override
    public String getName() {
        return pluginName;
    }

    @Override
    public List<Route> routes() {
        ArrayList<Route> list = new ArrayList<>();
        list.add(new Route(RestRequest.Method.GET, "/_print"));
        list.add(new Route(RestRequest.Method.GET, "/{index}/_print"));
        return list;
    }

    @Override
    protected RestChannelConsumer prepareRequest(RestRequest request, NodeClient client) throws IOException {
        System.out.println("params==" + request.params());
        long t1 = System.currentTimeMillis();
        String name = request.param("name");
 
        long cost = System.currentTimeMillis() - t1;
        return channel -> {
            XContentBuilder builder = channel.newBuilder();
            builder.startObject();
            builder.field("cost", cost);
            builder.field("name", name);
            builder.field("time", new Date());
            builder.field("pluginName", pluginName);
            builder.field("print","this is print plugin test");
            builder.endObject();
            channel.sendResponse(new BytesRestResponse(RestStatus.OK, builder));
        };
    }
 
}
