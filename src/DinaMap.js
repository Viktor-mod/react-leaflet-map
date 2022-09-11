import React, { useRef } from 'react';
import { MapContainer, TileLayer, GeoJSON, Popup, Marker } from 'react-leaflet';
// import countries from './countries.json'
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
        // mapRef: useRef(),
        lat: 51,
        lng: 105,
        zoom: 4,
        cs: null,
        url: "http://cris.icc.ru/dataset/list?f=2132&count_rows=true&unique=undefined&count_rows=1&iDisplayStart=0&iDisplayLength=10"

    };

    constructor(props) {
        super(props);

        this.GeoJsonLayer = React.createRef();
        this.handleChange = this.handleChange.bind(this);
    }

    handleClick = (e) => {
        e.preventDefault();
        console.log('The link was clicked.');
        this.getMapData(this.state.url)
    }

    handleChange(event) {
        console.log(this)
        this.setState({url: event.target.value});
    }

    componentDidMount() {
        // this.getMapData();
        console.log('hello')
    };

    getMapData = async (url) => {
        let MapData = await axios.get(
            url
        );

        let countries = await axios.get(
            "/countries.json"
        );
        // console.log(countries.data.features)

        // this.GeoJsonLayer.current.leafletElement.clearLayers().addData(countries)


        console.log(this.GeoJsonLayer.current)

        let reference = React.createRef();

        let fs = [];

        let Mlist = MapData.data.aaData;

        for (let index = 0; index < Mlist.length; index++) {
            const element = Mlist[index];
            // console.log(element.geom.split("(")[1].split(")")[0].split(" "));
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
              fs.push(feature);
            //   fs.push(GeoJsonLayer);
        }

        // console.log(MapData.data.aaData);

        this.setState({
            GeoJSON: MapData.aaData,
            reference: reference,
            features: fs,
            cs: countries.data,
            name: { "type": "GeometryCollection", "geometries": [ { "type": "Linestring", "coordinates": [[10.0, 11.2], [10.5, 11.9]] }, { "type": "Point", "coordinates": [10.0, 20.0] } ] },
            db: 10

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

                    {this.state.cs && (
                        <GeoJSON  attribution="Capa de Hospitales de ESRInn" data={this.state.features} ref={this.GeoJsonLayer} />
                    )} 
                </MapContainer>
                <input type="text" value={ this.state.url } onChange={this.handleChange}/><button onClick={this.handleClick}>Кнопка</button>
            </div>
        )
    };
};
