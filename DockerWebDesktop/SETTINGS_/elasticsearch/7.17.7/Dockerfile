FROM elasticsearch:7.17.7

ENV discovery.type single-node
ENV cluster.routing.allocation.disk.threshold_enabled false

ADD elasticsearch.yml /usr/share/elasticsearch/config/elasticsearch.yml

EXPOSE 9200
EXPOSE 9300
