import React from 'react';
import { MapContainer, TileLayer, GeoJSON, Popup, Marker } from 'react-leaflet';
import L from 'leaflet'
import axios from 'axios'

import './App.css'

L.Icon.Default.imagePath = "https://unpkg.com/leaflet@1.5.0/dist/images/";

// const position = [51, 105];

export class DinaMap extends React.Component {
    state = {
        GeoJSON: null,
        reference: null,
        features: [],
        lat: 51,
        lng: 105,
        zoom: 4
    };

    componentDidMount() {
        this.getMapData()
    };

    getMapData = async () => {
        let MapData = await axios.get(
            "http://cris.icc.ru/dataset/list?f=2132&count_rows=true&unique=undefined&count_rows=1&iDisplayStart=0&iDisplayLength=10"
        );

        let reference = React.createRef();

        let fs = [];

        let Mlist = MapData.data.aaData;

        for (let index = 0; index < Mlist.length; index++) {
            const element = Mlist[index];
            console.log(element.geom.split("(")[1].split(")")[0].split(" "));
            let feature = { 
                "type": "Feature", 
                "properties": { 
                  "style": { 
                    "color": "#004070",
                    "weight": 4, 
                    "opacity": 1 
                  } 
                }, 
                "geometry": { 
                  "type": "MultiPoint", 
                  "coordinates": [ 
                    element.geom.split("(")[1].split(")")[0].split(" ")
                  ] 
                }
              };

              let GeoJsonLayer = new L.GeoJSON(feature);
              fs.push(GeoJsonLayer);
        }

        console.log(MapData.data.aaData);

        this.setState({
            GeoJSON: MapData.aaData,
            reference: reference,
            features: fs
        });
    };

    render() {
        const center = [this.state.lat, this.state.lng]
        
        return (
            <div>
                <MapContainer className="markercluster-map"  center={center} zoom={this.state.zoom} scrollWheelZoom={false}>
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <Marker position={center}>
                        <Popup>
                            Тута
                        </Popup>
                    </Marker>
                    <GeoJSON data={this.state.features} ref={this.state.reference} />
                </MapContainer>
            </div>
            
        )
    };
};
