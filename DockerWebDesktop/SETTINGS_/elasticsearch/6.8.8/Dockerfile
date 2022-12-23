FROM elasticsearch:6.8.8

ENV discovery.type single-node
ENV cluster.routing.allocation.disk.threshold_enabled false

ADD elasticsearch.yml /usr/share/elasticsearch/config/elasticsearch.yml

EXPOSE 9200
EXPOSE 9300
