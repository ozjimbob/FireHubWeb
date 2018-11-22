
$(document).ready(function(){
    window.mymap = L.map('map').setView([-32.2,147.9],6);
    window.rects=[]
L.tileLayer('http://maps.six.nsw.gov.au/arcgis/rest/services/public/NSW_Base_Map/MapServer/tile/{z}/{y}/{x}', {
    attribution: 'NSW Government SixMaps',
    maxZoom: 13,
    id: 'nsw.topo',
}).addTo(window.mymap);
});


