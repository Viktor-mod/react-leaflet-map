import React from 'react';
import { MapContainer, TileLayer, GeoJSON, Marker, CircleMarker } from 'react-leaflet';
import axios from 'axios'
import inside from 'point-in-polygon'

import './App.css'
import './DinaMap.css'
// import Select from 'react-select'
// import { polygon } from 'leaflet';

// const options = [
//     { value: 'region', label: 'Регионы' },
//     { value: 'rayon', label: 'Районы' },
// ]

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
        url: "https://geos.icc.ru/dataset/list?f=2132",
        minColor: '#ff0000',
        maxColor: '#00FF2A',
        pointColor: '#000000',
        maxCnt: 0,
        admLvl: ""
    };

    constructor(props) {
        super(props);

        this.GeoJsonLayer = React.createRef();
        this.handleChange = this.handleChange.bind(this);
        this.handleMinColor = this.handleMinColor.bind(this);
        this.handleMaxColor = this.handleMaxColor.bind(this);
        this.handlePointColor = this.handlePointColor.bind(this);
        this.handleAdmLvl = this.handleAdmLvl.bind(this);
        this.mapRef = React.createRef();
        this.style = this.style.bind(this);
    }

    clearMap() {
        console.log(this.mapRef)
        const map = this.mapRef.current.leafletElement;
        map.eachLayer(function (layer) {
            map.removeLayer(layer);
        });
    };

    handleClick = (e) => {
        e.preventDefault();
        console.log('The link was clicked.');
        this.getMapData(this.state.url)
    };

    handleChange(event) {
        console.log(this)
        this.setState({ url: event.target.value });
    };

    handleAdmLvl(event) {
        console.log(this)
        this.setState({ admLvl: event.target.value });
        // this.getAdmLvl(event.target.value)
    };

    handleMinColor(event) {
        console.log(this)
        this.setState({ minColor: event.target.value });
    };

    handleMaxColor(event) {
        console.log(this)
        this.setState({ maxColor: event.target.value });
    };

    handlePointColor(event) {
        console.log(this)
        this.setState({ pointColor: event.target.value });
    };

    getPart(i, qnt, minColor, maxColor) {
        let iMinR = parseInt(minColor, 16);
        let iMaxR = parseInt(maxColor, 16);
        let n = iMaxR - iMinR;
        let step = n / qnt;

        let newR = Math.round(iMinR + step * i).toString(16)
        if (newR < 0) {
            console.log(newR);
        }
        if (newR.length === 1) {
            newR = '0' + newR;
        }

        return newR;
    };

    getColor(i, qnt) {
        let nMinR = this.state.minColor.charAt(1) + this.state.minColor.charAt(2);
        let nMaxR = this.state.maxColor.charAt(1) + this.state.maxColor.charAt(2);
        let nMinG = this.state.minColor.substring(3, 5);
        let nMaxG = this.state.maxColor.substring(3, 5);
        let nMinB = this.state.minColor.substring(5, 7);
        let nMaxB = this.state.maxColor.substring(5, 7);

        console.log(nMinG, nMaxG)

        return "#" + this.getPart(i, qnt, nMinR, nMaxR) + this.getPart(i, qnt, nMinG, nMaxG) + this.getPart(i, qnt, nMinB, nMaxB);
    };

    componentDidMount() {
        // this.getMapData();
        console.log('hello')
    };

    getAdmLvl = async (admLvl) => {
        let countries = null;
        if (admLvl === "region") {
            countries = await axios.get(
                "/oblast.json"
            );
        } else if (admLvl === "district") {
            countries = await axios.get(
                "/region.json"
            );
        };

        return countries.data;
        // if (countries !== null) {
        //     let maxCnt = this.countPoints(countries.data, this.state.points);
        //     this.setState({
        //         cs: countries.data,
        //         // maxCnt: maxCnt
        //     });
        // }
    };

    getMapData = async (url) => {
        if (this.state.admLvl === '') {
            alert("Выберите административное деление")

            return;
        };

        let polygons = await this.getAdmLvl(this.state.admLvl);
        let MapData = await axios.get(url);

        console.log(this.GeoJsonLayer.current)

        let reference = React.createRef();
        let points = [];
        let Mlist = MapData.data.aaData;

        for (let index = 0; index < Mlist.length; index++) {
            const element = Mlist[index];

            let coords = element.geom.split("(")[1].split(")")[0].split(" ");
            points.push({ lat: coords[1], lng: coords[0], color: this.getColor(index, Mlist.length) })
        };

        let maxCnt = 0;
        // if (this.state.cs) {
        maxCnt = this.countPoints(polygons, points);

        // };

        this.setState({
            GeoJSON: MapData.aaData,
            reference: reference,
            // features: countries.data,
            name: { "type": "GeometryCollection", "geometries": [{ "type": "Linestring", "coordinates": [[10.0, 11.2], [10.5, 11.9]] }, { "type": "Point", "coordinates": [10.0, 20.0] }] },
            db: 10,
            points: points,
            maxCnt: maxCnt,
            cs: polygons
        });
    };

    countPoints(polygons, points) {
        let maxCnt = 0;

        for (let i = 0; i < points.length; i++) {
            let pnt = points[i];
            pnt.lat = parseFloat(pnt.lat);
            pnt.lng = parseFloat(pnt.lng);
            for (let j = 0; j < polygons.features.length; j++) {
                let feature = polygons.features[j];
                if (inside([pnt.lng, pnt.lat], feature.geometry.coordinates[0][0])) {
                    if ("cnt" in feature) {
                        feature.cnt = feature.cnt + 1;
                    } else {
                        feature.cnt = 1;
                    }
                    if (maxCnt < feature.cnt) {
                        maxCnt = feature.cnt
                    }
                    break
                };
            }
        };

        return maxCnt;
    };


    style(feature) {
        // const polygon = feature.geometry.coordinates[0][0];
        // let qntInPol = 0;
        // // let co = '#D92626';
        // if ( feature.properties.ADMIN === 'Russia' ) {
        //     // co = '#00FF04'
        //     // console.log(this)

        // };
        // for ( let i = 0; i < this.state.points.length; i++) {
        //     let pnt = this.state.points[i];
        //     pnt.lat = parseFloat(pnt.lat);
        //     pnt.lng = parseFloat(pnt.lng);
        //     if (inside([pnt.lng, pnt.lat], polygon)) {
        //         qntInPol = qntInPol + 1;
        //     };
        // };
        // console.log(qntInPol)
        let clr = this.getColor(0, this.state.maxCnt);

        if ("cnt" in feature) {
            clr = this.getColor(feature.cnt, this.state.maxCnt)
        };

        return {
            fillColor: clr,
            weight: 1,
            opacity: 1,
            color: '#ffffff',
            dashArray: '1',
            fillOpacity: 0.5
        };
    };

    render() {
        const center = [this.state.lat, this.state.lng];

        return (
            <div className="container">
                <div>
                    <MapContainer center={center} zoom={this.state.zoom} scrollWheelZoom={true}>
                        <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                            // url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            url="https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.png"
                        />
                        {this.state.cs && (
                            <GeoJSON data={this.state.cs} ref={this.GeoJsonLayer} style={this.style} />
                        )};
                        {this.state.points.map((elem, i) => {
                            console.log(this.state.points.length)
                            return (
                                <Marker position={{ lat: elem.lat, lng: elem.lng }} key={i}>
                                    {/* <Circle
                                        center={{ lat: elem.lat, lng: elem.lng }}
                                        fillColor={this.state.pointColor}
                                        color={'#ffffff'}
                                        weight={1}
                                        radius={18000} /> */}
                                    <CircleMarker
                                        center={{ lat: elem.lat, lng: elem.lng }}
                                        fillColor={this.state.pointColor}
                                        color={this.state.pointColor}
                                        weight={1}
                                        radius={5}
                                    />

                                </Marker>
                            )
                        })}
                    </MapContainer>
                </div>
                <div className="nav-bar">
                    <div>
                        <h1 className="block-title">Данные</h1>
                        <div className="search-block">
                            <input className="custom-input" type="text"
                                value={this.state.url}
                                onChange={this.handleChange}
                            />
                            <button className="search-block__button" onClick={this.handleClick}>
                                <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
                                    <path d="m20 8h-2a5 5 0 0 0 -10 0h-2a7 7 0 0 1 14 0z" /><path d="m25 15a2.94 2.94 0 0 0 -1.47.4 3 3 0 0 0 -2.53-1.4 2.94 2.94 0 0 0 -1.47.4 3 3 0 0 0 -3.53-1.22v-5.18a3 3 0 0 0 -6 0v11.1l-2.23-1.52a2.93 2.93 0 0 0 -1.77-.58 3 3 0 0 0 -2.12 5.13l8 7.3a6.16 6.16 0 0 0 4.12 1.57h5a7 7 0 0 0 7-7v-6a3 3 0 0 0 -3-3zm1 9a5 5 0 0 1 -5 5h-5a4.17 4.17 0 0 1 -2.76-1l-7.95-7.3a1 1 0 0 1 -.29-.7 1 1 0 0 1 1.6-.8l5.4 3.7v-14.9a1 1 0 0 1 2 0v11h2v-3a1 1 0 0 1 2 0v3h2v-2a1 1 0 0 1 2 0v2h2v-1a1 1 0 0 1 2 0z" />
                                    <path d="m0 0h32v32h-32z" fill="none" />
                                </svg>
                            </button>
                        </div>
                    </div>
                    <div>
                        <h1 className="block-title">Территориальная единица</h1>
                        <select className="dropdown" onChange={this.handleAdmLvl} value={this.state.admLvl}>
                            <option value="">
                                Выберите...
                        </option>
                            <option
                                value="region"
                            >
                                Регионы
                        </option>
                            <option
                                value="district"
                            >
                                Районы
                        </option>
                        </select>
                    </div>
                    {/* <Select onChange={this.handleAdmLvl} value={this.state.admLvl} options={options} /> */}
                    <div className="color-block">
                        <h1 className="block-title">Стилизация</h1>
                        <div className="color-style__block">
                            <label>
                                <input className="color-min"
                                    type="color"
                                    id="color-min"
                                    name="color-min"
                                    value={this.state.minColor}
                                    onChange={this.handleMinColor}
                                />
                            </label>
                            <h4>Начальный цвет</h4>
                        </div>
                        <div className="color-style__block">
                            <label>
                                <input className="color-max"
                                    type="color"
                                    id="color-max"
                                    name="color-max"
                                    value={this.state.maxColor}
                                    onChange={this.handleMaxColor}
                                />
                            </label>
                            <h4>Конечный цвет</h4>
                        </div>
                        <div className="color-style__block">
                            <label>
                                <input className="color-max"
                                    type="color"
                                    id="color-max"
                                    name="color-max"
                                    value={this.state.pointColor}
                                    onChange={this.handlePointColor}
                                />
                            </label>
                            <h4>Цвет точки</h4>
                        </div>
                    </div>
                </div>
            </div>
        )
    };
};
