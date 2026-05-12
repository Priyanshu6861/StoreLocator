import Plugin from 'src/plugin-system/plugin.class';
import HttpClient from 'src/service/http-client.service';

export default class StoreLocatorDetail extends Plugin {

    init() {

        this._addMap();
        this._client = new HttpClient();
        this._registerEvents();
    }
    _registerEvents() {
    }
    _addMap() {
        var apiKey = document.getElementById('store_locator_map').getAttribute('data-key');
        var scriptElement = document.createElement('script');
        scriptElement.src = "https://maps.googleapis.com/maps/api/js?key=" + apiKey + "&libraries=geometry,places";
        scriptElement.async = true;
        scriptElement.defer = true;

        // Set an event listener to wait for the script to load before using `google`
        scriptElement.onload = () => {
            this._initMap(); // Initialize map after script loads
        };

        document.head.appendChild(scriptElement);
    }

    // Separate function to initialize the map
    _initMap() {
        var mapElement = document.getElementById('store_locator_map');

        if (!mapElement) {
            console.error("Map container not found.");
            return;
        }
        const lat = parseFloat(mapElement.getAttribute('lat'));
        const lng = parseFloat(mapElement.getAttribute('lng'));
        const zoom = parseFloat(mapElement.getAttribute('zoom'));
        var map = new google.maps.Map(mapElement, {
            center: { lat: lat, lng: lng },
            zoom: zoom
        });

        var marker = new google.maps.Marker({
            position: { lat: lat, lng: lng },
            map: map,
            title: 'Marker Title'
        });

        // var infoWindow = new google.maps.InfoWindow({
        //     content: "<h3>"+ mapElement.getAttribute('store-title') +"</h3>"
        // });

        // infoWindow.open(map, marker);
        // map.panTo({ lat: lat, lng: lng });

        if (window.matchMedia("(max-width: 767px)").matches) {
            mapElement.scrollIntoView({ behavior: 'smooth' });
        }

    }
    _searchOnMap(lat = null, lng = null, zoom = null, activeStore = null) {
        const input = document.getElementById("store_search");
        const searchBox = new google.maps.places.SearchBox(input);

        var map = new google.maps.Map(document.getElementById('store_locator_map'), {
            center: { lat: lat, lng: lng },
            zoom: zoom
        });
        map.addListener('bounds_changed', function () {
            searchBox.setBounds(map.getBounds());
        });
        var marker = new google.maps.Marker({
            position: { lat: lat, lng: lng },
            map: map,
            title: 'Marker Title'
        });
        var infoWindow = new google.maps.InfoWindow({
            content: activeStore.innerHTML
        });

        infoWindow.open(map, marker);

        document.addEventListener('click', function (e) {
            if (e.target.classList.contains('store_locator_content active') || e.target.closest('.store_locator_content') && e.target.closest('.store_locator_content').classList.contains('active')) {
                var mainDiv = e.target.classList.contains('store_locator_content active') ? e.target : e.target.closest('.store_locator_content');
                var lat = parseFloat(mainDiv.getAttribute('data-lat'));
                var lng = parseFloat(mainDiv.getAttribute('data-lng'));
                var latLng = { lat: lat, lng: lng };

                if (marker) {
                    marker.setMap(null);
                }

                marker = new google.maps.Marker({
                    position: latLng,
                    map: map
                });

                var infoWindow = new google.maps.InfoWindow({
                    content: mainDiv.querySelector('.store_locator_info').innerHTML
                });

                infoWindow.open(map, marker);

                map.panTo(latLng);
                if (window.matchMedia("(max-width: 767px)").matches) {
                    document.getElementById('store_locator_map').scrollIntoView({ behavior: 'smooth' });
                }

            }
        });

        input.addEventListener('keydown', function (e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                return false;
            }
        });

        var searchButton = document.getElementById("store_search_button");
        searchButton.addEventListener('click', async function (e) {
            var range = parseInt(document.getElementById('store_search_range').value, 10);
            var maxRange = parseInt(document.getElementById('store_search_range').max, 10);
            var unit = document.getElementById('store_search_range').unit;
            if (maxRange < range) {
                alert(window.storelocator.rangeError);
            } else {
                var address = document.getElementById("store_search").value;
                var geocoder = new google.maps.Geocoder();
                var latitude = 0;
                var longitude = 0;
                if (address) {
                    await geocoder.geocode({ 'address': address }, function (results, status) {
                        if (status == 'OK') {
                            latitude = results[0].geometry.location.lat();
                            longitude = results[0].geometry.location.lng();
                        }
                    });
                } else {
                    navigator.geolocation.getCurrentPosition(function (position) {
                        latitude = position.coords.latitude ? position.coords.latitude : 0;
                        longitude = position.coords.longitude ? position.coords.longitude : 0;
                    });
                }
                if (!(longitude || latitude)) {
                    document.getElementsByClassName('store_locator_content')[0].click();
                } else {
                    var payload = JSON.stringify({ 'longitude': longitude, 'latitude': latitude, 'range': range });
                    var requestUrl = e.target.getAttribute('data-url');
                    var client = new HttpClient();
                    await client.post(
                        requestUrl,
                        payload,
                        (response) => {
                            const responseData = JSON.parse(response);
                            if (responseData.status === 200) {
                                if (responseData.data.length) {
                                    var appendData = '';
                                    responseData.data.forEach(function (storedata) {
                                        var data = `<div class="store_locator_content" data-lat="` + storedata.latitude + `" data-lng="` + storedata.longitude + `" data-zoom="` + storedata.zoom + `"><div class="store_locator_info">`;
                                        if (storedata.logo) {
                                            data = data + `<div class="store_locator_icon"><img src="` + storedata.logo + `" alt="` + storedata.title + `" width="100" height="100"/></div>`;
                                        }
                                        data = data + `<div class="store_locator_details">`;
                                        if (storedata.url) {
                                            data = data + `<div class="store_url"><a href="` + storedata.url + `" target="_blank" rel="noopener"><h2 class="store_title">` + storedata.title + `</h2></a></div>`;
                                        } else {
                                            data = data + `<h2 class="store_title">` + storedata.title + `</h2>`;
                                        }
                                        data = data + `
                                            <span class="store_address">`+ window.storelocator.address + `: ` + storedata.address + `</span>
                                            <span class="store_city">`+ window.storelocator.cityLabel + `: ` + storedata.city + ` </span>`;
                                        if (storedata.state) {
                                            data = data + `<span class="store_state">` + window.storelocator.stateLabel + `: ` + storedata.state + `</span>`;
                                        }
                                        data = data + `<span class="store_zip">` + window.storelocator.zipcodeLabel + `: ` + storedata.zip + `</span>
                                            <span class="store_country">`+ window.storelocator.countryLabel + `: ` + storedata.country + `</span>`;
                                        if (storedata.email) {
                                            data = data + `<span class="store_email">` + window.storelocator.mail + `: ` + storedata.email + `</span>`;
                                        }
                                        if (storedata.number) {
                                            data = data + `<span class="store_number">` + window.storelocator.number + `: ` + storedata.number + `</span>`;
                                        }
                                        data = data + `</div></div>`;

                                        if (storedata.working_hours) {
                                            var currentDate = new Date();
                                            var today = currentDate.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
                                            var todaySchedule = storedata.working_hours[today];
                                            if (todaySchedule.active) {
                                                var today = new Date("2000-01-01T" + todaySchedule.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }) + ' - ' + new Date("2000-01-01T" + todaySchedule.end).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
                                            } else {
                                                var today = window.storelocator.close;
                                            }
                                            data = data + `
                                                            <div class="store_locator_schedule"><div class="store_locator_schedule_today hidden">
                                                                <p>
                                                                <span class="day_title">
                                                                <span class="watch_icon"> 
                                                                <span class="icon icon-clock">
                                                                    <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
                                                                    width="24" height="24" viewBox="0 0 24 24">
                                                                    <defs>
                                                                        <path d="M13 11V6c0-.5523-.4477-1-1-1s-1 .4477-1 1v6c0 .5523.4477 1 1 1h4c.5523 0 1-.4477 1-1s-.4477-1-1-1h-3zm-1 13C5.3726 24 0 18.6274 0 12S5.3726 0 12 0s12 5.3726 12 12-5.3726 12-12 12zm0-2c5.5228 0 10-4.4772 10-10S17.5228 2 12 2 2 6.4772 2 12s4.4772 10 10 10z"
                                                                        id="icons-default-clock"></path>
                                                                    </defs>
                                                                    <use xlink:href="#icons-default-clock" fill="#758CA3" fill-rule="evenodd"></use>
                                                                    </svg>
                                                                </span>
                                                                </span>`+ window.storelocator.time + `:</span><span class="timer">` + today + `<span class="arrow_dropdown"><span class="icon icon-arrow-head-down">
                                                                <svg
                                                                xmlns="http://www.w3.org/2000/svg"
                                                                xmlns:xlink="http://www.w3.org/1999/xlink"
                                                                width="24"
                                                                height="24"
                                                                viewBox="0 0 24 24"
                                                                >
                                                                <defs>
                                                                    <path
                                                                    id="icons-default-arrow-head-down"
                                                                    d="m12 7.4142 10.2929 10.293c.3905.3904 1.0237.3904 1.4142 0 .3905-.3906.3905-1.0238 0-1.4143l-11-11c-.3905-.3905-1.0237-.3905-1.4142 0l-11 11c-.3905.3905-.3905 1.0237 0 1.4142.3905.3905 1.0237.3905 1.4142 0L12 7.4142z"
                                                                    ></path>
                                                                </defs>
                                                                <use
                                                                    transform="matrix(1 0 0 -1 0 23)"
                                                                    xlink:href="#icons-default-arrow-head-down"
                                                                    fill="#758CA3"
                                                                    fill-rule="evenodd"
                                                                ></use>
                                                                </svg> </span
                                                            ></span>
                                                            <span class="arrow_dropup">
                                                            <span class="icon icon-arrow-head-up">
                                                                <svg
                                                                xmlns="http://www.w3.org/2000/svg"
                                                                xmlns:xlink="http://www.w3.org/1999/xlink"
                                                                width="24"
                                                                height="24"
                                                                viewBox="0 0 24 24"
                                                                >
                                                                <defs>
                                                                    <path
                                                                    id="icons-default-arrow-head-up"
                                                                    d="m12 7.4142 10.2929 10.293c.3905.3904 1.0237.3904 1.4142 0 .3905-.3906.3905-1.0238 0-1.4143l-11-11c-.3905-.3905-1.0237-.3905-1.4142 0l-11 11c-.3905.3905-.3905 1.0237 0 1.4142.3905.3905 1.0237.3905 1.4142 0L12 7.4142z"
                                                                    ></path>
                                                                </defs>
                                                                <use
                                                                    xlink:href="#icons-default-arrow-head-up"
                                                                    fill="#758CA3"
                                                                    fill-rule="evenodd"
                                                                ></use>
                                                                </svg> </span
                                                            ></span>
                                                        </span>
                                                        </p>
                                                    </div>
                                                    <div class="store_locator_schedule_all">`;

                                            for (var day in storedata.working_hours) {
                                                if (storedata.working_hours.hasOwnProperty(day)) {
                                                    var dayData = storedata.working_hours[day];
                                                    data = data + `
                                                        <p>
                                                            <span class="day_title"> ` + day.charAt(0).toUpperCase() + day.slice(1) + ` : </span>`;

                                                    if (dayData.active) {
                                                        var startTime = new Date("2000-01-01T" + dayData.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
                                                        var endTime = new Date("2000-01-01T" + dayData.end).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });

                                                        data = data + `<span class="timer"> ` + startTime + ' - ' + endTime + ` </span>
                                                            </p>`;
                                                    } else {
                                                        data = data + `<span class="timer"> ` + window.storelocator.close + ` </span>
                                                                </p>`;
                                                    }
                                                }
                                            }
                                            data = data + `</div> </div></div>`;
                                        }


                                        appendData = appendData + data;
                                    });
                                    document.getElementById('store_locator_stores').innerHTML = appendData;
                                    var storeList = document.getElementsByClassName('store_locator_content');
                                    for (var i = 0; i < storeList.length; i++) {
                                        storeList[i].addEventListener('click', function (event) {
                                            var flag = false;
                                            var mainDiv = event.target;
                                            if (mainDiv.classList.contains('store_locator_content') === true && mainDiv.classList.contains('active') === false) {
                                                flag = true;
                                            } else {
                                                mainDiv = mainDiv.closest('.store_locator_content');
                                                if (mainDiv.classList.contains('active') === false) {
                                                    flag = true;
                                                }
                                            }
                                            if (flag) {
                                                var content = document.getElementsByClassName('store_locator_content');
                                                Array.from(content).forEach(function (element) {
                                                    element.classList.remove('active');
                                                });
                                                mainDiv.classList.add('active');
                                            }
                                        });
                                    }
                                    var elements = document.querySelectorAll('.store_locator_schedule_today');
                                    elements.forEach(function (element) {
                                        element.addEventListener('click', function (event) {
                                            if (element.classList.contains('hidden')) {
                                                element.classList.remove('hidden');
                                            } else {
                                                element.classList.add('hidden');
                                            }
                                            event.stopPropagation();
                                        });
                                    });
                                    if (window.matchMedia("(max-width: 767px)").matches) {
                                        document.getElementById('store_locator_map').scrollIntoView({ behavior: 'smooth' });
                                    }
                                } else {
                                    alert(window.storelocator.searchError);
                                    document.getElementById('store_locator_stores').innerHTML = '';
                                }
                                var pages = responseData.pagination.pages;
                                var pageUpdate = '';
                                if (pages > 1) {
                                    for (var i = 1; i <= pages; i++) {
                                        if (i === 1) {
                                            pageUpdate = pageUpdate + `<span class="store_locator_page active">` + i + `</span>`;
                                        } else {
                                            pageUpdate = pageUpdate + `<span class="store_locator_page">` + i + `</span>`;
                                        }
                                    }
                                }
                                if (pageUpdate) {
                                    document.getElementById('store_locator_pagination').innerHTML = pageUpdate;
                                }
                            }
                        });
                }
            }
        });
    }
}