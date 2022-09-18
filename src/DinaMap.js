import React, { useState } from 'react';
import { MapContainer, TileLayer, GeoJSON, Popup, Marker, Circle } from 'react-leaflet';
// import countries from './countries.json'
import L from 'leaflet'
import axios from 'axios'

import './App.css'
import './DinaMap.css'
// L.Icon.Default.imagePath = "https://unpkg.com/leaflet@1.5.0/dist/images/";
delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
    iconRetinaUrl: require('leaflet/dist/images/marker-pin.png'),
    iconUrl: require('leaflet/dist/images/marker-pin.png'),
    shadowUrl: require('leaflet/dist/images/marker-shadow.png')
})



// const position = [51, 105];  

// function GetIcon(_iconSize) {
//     return L.icon({
//         iconRetinaUrl: require("leaflet/dist/images/marker-pin.png"),
//         iconUrl: require("leaflet/dist/images/marker-pin.png"),
//         shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
//         iconSize: [_iconSize]
//     })
// };

export class DinaMap extends React.Component {

    state = {
        GeoJSON: null,
        reference: null,
        features: [],
        points: [{
            lat: 51,
            lng: 105,
            color: '#000000'
        }],
        lat: 51,
        lng: 105,
        zoom: 4,
        cs: null,
        url: "http://cris.icc.ru/dataset/list?f=2132&count_rows=true&unique=undefined&count_rows=1&iDisplayStart=0&iDisplayLength=10",
        minColor: '#000000',
        maxColor: '#f5f5f5'
    };

    constructor(props) {
        super(props);

        this.GeoJsonLayer = React.createRef();
        this.handleChange = this.handleChange.bind(this);
        this.handleMinColor = this.handleMinColor.bind(this);
        this.handleMaxColor = this.handleMaxColor.bind(this);
        this.mapRef = React.createRef();
    }

    clearMap() {
        console.log(this.mapRef)
        const map = this.mapRef.current.leafletElement;
        map.eachLayer(function (layer) {
          map.removeLayer(layer);
        });
    }

    handleClick = (e) => {
        e.preventDefault();
        console.log('The link was clicked.');
        this.getMapData(this.state.url)
    }

    handleChange(event) {
        console.log(this)
        this.setState({url: event.target.value});
    };

    handleMinColor(event) {
        console.log(this)
        this.setState({minColor: event.target.value});
    };

    handleMaxColor(event) {
        console.log(this)
        this.setState({maxColor: event.target.value});
    };

    getPart(i, qnt, minColor, maxColor) {
        let iMinR = parseInt(minColor, 16);
        let iMaxR = parseInt(maxColor, 16);
        let n = iMaxR - iMinR;
        let step = n / (qnt - 1);

        let newR = Math.round(iMinR + step * i).toString(16)
        if ( newR.length === 1 ) {
            newR = '0' + newR;
        }
        // console.log(newR)

        return newR
    };

    getColor(i, qnt) {
        let nMinR = this.state.minColor.charAt(1) + this.state.minColor.charAt(2);
        let nMaxR = this.state.maxColor.charAt(1) + this.state.maxColor.charAt(2);
        let nMinG = this.state.minColor.substring(3, 5);
        let nMaxG = this.state.maxColor.substring(3, 5);
        let nMinB = this.state.minColor.substring(6, 8);
        let nMaxB = this.state.maxColor.substring(6, 8);
        console.log(nMinG, nMaxG)
        return "#" + this.getPart(i, qnt, nMinR, nMaxR)  + this.getPart(i, qnt, nMinG, nMaxG) + this.getPart(i, qnt, nMinB, nMaxB)
    };

    componentDidMount() {
        // this.getMapData();
        console.log('hello')
    };

    getMapData = async (url) => {
        let MapData = await axios.get(url);

        // this.clearMap();

        let countries = await axios.get(
            "/countries.json"
        );
        // console.log(countries.data.features)

        // this.GeoJsonLayer.current.leafletElement.clearLayers().addData(countries)


        console.log(this.GeoJsonLayer.current)

        let reference = React.createRef();

        let fs = [];
        let points = [];
        let Mlist = MapData.data.aaData;
        for (let index = 0; index < Mlist.length; index++) {
            const element = Mlist[index];
            // console.log(element.geom.split("(")[1].split(")")[0].split(" "));
            // let feature = { 
            //     "type": "Feature", 
            //     "properties": { 
            //       "style": { 
            //         "color": "#f04070",
            //         "weight": 4, 
            //         "opacity": 1 
            //       } 
            //     }, 
            //     "geometry": { 
            //       "type": "MultiPoint", 
            //       "coordinates": [ 
            //         element.geom.split("(")[1].split(")")[0].split(" ")
            //       ] 
            //     }
            //   };

            //   let GeoJsonLayer = new L.GeoJSON(feature);
            //   fs.push(feature);
              let coords = element.geom.split("(")[1].split(")")[0].split(" ");
              points.push({lat:coords[1], lng:coords[0], color:this.getColor(index, Mlist.length)})
            //   console.log(this.getColor(index, Mlist.length))
            //   fs.push(GeoJsonLayer);
        };

        console.log(points);

        this.setState({
            GeoJSON: MapData.aaData,
            reference: reference,
            features: fs,
            cs: countries.data,
            name: { "type": "GeometryCollection", "geometries": [ { "type": "Linestring", "coordinates": [[10.0, 11.2], [10.5, 11.9]] }, { "type": "Point", "coordinates": [10.0, 20.0] } ] },
            db: 10,
            points: points

        });
    };

    render() {
        const center = [this.state.lat, this.state.lng]

        return (
            <div>
                <MapContainer center={center} zoom={this.state.zoom} scrollWheelZoom={false}>
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    {this.state.points.map((elem, i) => {
                        console.log(this.state.points.length)
                        return (
                            <Marker position={{lat:elem.lat, lng:elem.lng}} key={i}>
                                <Circle 
                                    center={{lat:elem.lat, lng:elem.lng}}
                                    fillColor={elem.color}
                                    color={elem.color}
                                    radius={29000}/>
                            </Marker> 
                        )
                    })}

                    { this.state.cs && (
                        <GeoJSON data={this.state.features} ref={this.GeoJsonLayer} />
                    )};
                </MapContainer>
                <input type="text" value={ this.state.url } onChange={this.handleChange}/><button onClick={this.handleClick}>Кнопка</button>
                <div className="color-block">
                    <div className="color-min_block">
                        <input className="color-min" type="color" name="min" value={ this.state.minColor } onChange={this.handleMinColor}/>
                        <p>Минимальный цвет</p>
                    </div>
                    <div className="color-min_block">
                        <input className="color-max" type="color" name="max" value={ this.state.maxColor } onChange={this.handleMaxColor}/>
                        <p>Максимальный цвет</p>
                    </div>
                </div>
            </div>
        )
    };
};
