/**
 * The 3D globe, check globe.js for details.
 */
var globe;

/**
 * Selects and renders the data feed
 * @function
 * @param {Number} idx The index of the data feed to retrieve and render
 */
var switchData = function (idx) {  
  // Set the name of the data feed that will be displayed
  document.getElementById("currentInfoSpan").innerHTML = Joshfire.factory.config.datasources.main[i].name;

  // Fetch the data feed
  Joshfire.factory.getDataSource("main").children[idx].find({}, function (err, data) {
    var formattedData = [],
      i = 0,
      item = null,
      lat = null,
      lng = null,
      geo = null,
      value = 0;
    
    var isNaN = function (obj) {
      return obj !== obj;
    };

    if (err || !data || !data.entries) {
      // TODO: alert the user that something went wrong
      return;
    }

    for (i = 0; i < data.entries.length; i++) {
      item = data.entries[i];

      if (item.meta &&
        item.meta[gsx:lat] &&
        item.meta[gsx:lng] &&
        item.meta[gsx:data]) {
        // Item taken from a Google spreadsheet
        lat = parseFloat(item.meta[gsx:lat]);
        lng = parseFloat(item.meta[gsx:lng]);
        value = parseFloat(item.meta[gsx.data]);
      }
      else {
        // TODO: would be cool to let the user decide which
        // properties to use to extract the coordinates
        // and the value to display
        // Extract coordinates from possible candidates
        if (item.geo) {
          geo = item.geo;
        }
        else if (item.contentLocation) {
          geo = item.contentLocation.geo;
        }
        else if (item.location) {
          geo = item.location.geo;
        }
        else if (item.homeLocation) {
          geo = item.homeLocation.geo;
        }
        else if (item.workLocation) {
          geo = item.workLocation.geo;
        }
        else if (item.jobLocation) {
          geo = item.jobLocation.geo;
        }
        if (!geo || !geo.latitude || !geo.longitude) {
          continue;
        }
        lat = parseFloat(geo.latitude);
        lng = parseFloat(geo.longitude);

        // Extract value from property candidates
        value = null;
        if (item.ratingValue) {
          value = item.ratingValue;
        }
        else if (item.aggregateRating) {
          value = item.aggregateRating.ratingValue;
        }
        else if (item.baseSalary) {
          value = item.baseSalary;
        }
        else if (item.offers && (item.offers.length > 0)) {
          value = item.offers[0].price;
        }
        else if (item.wordCount) {
          value = item.wordCount;
        }
        else if (item.numberOfPages) {
          value = item.numberOfPages;
        }
        else if (geo.elevation) {
          value = geo.elevation;
        }
        if (!value) {
          continue;
        }
        value = parseFloat(value);
      }

      if (isNaN(lat) || isNaN(lng) || isNaN(value) ||
        (lat < -90) || (lat > 90) ||
        (lng < -180) || (lng > 180)) {
        // Invalid coordinates or value, skip the item
        continue;
      }

      // Add the item to the list
      formattedData.push({
        "title": item.name,
        "lat": lat,
        "lng": lng,
        "value": value
      });
    }

    globe.addData(
      formattedData,
      100,
      {
        format: 'magnitude',
        name: 'main-' + idx,
        animated: false,
        color_gradient_reversed: true
      }
    );
    globe.createPoints();
    globe.animate();
  });
};

/**
 * Main entry point of the application, run when all scripts have been loaded
 * @function
 */
var load = function () {
  var container = null,
    i = 0,
    data = null,
    name = null;

  // Check WebGL support
  if (!Detector.webgl) {
    Detector.addGetWebGLMessage();
    return;
  }

  // Initialize the globe container
  container = document.getElementById('container');
  globe = new DAT.Globe(container);

  // Check the list of datasource feeds.
  var data = Joshfire.factory.getDataSource("main");
  if (!data) {
    return alert("No data source configured");
  }

  // When there is more than one feed, the user can switch
  // from one feed to the other.
  for (i = 0; i < data.children.length; i++) {
    var name = Joshfire.factory.config.datasources.main[i].name;

    if (data.children.length > 1) {
      document.getElementById("links").innerHTML += '<a href="' +
        'javascript:switchData(' + i + ');" class="dataset activated">' +
        name + '</a><br/>';
    }
  }

  // Select and render the first data feed
  switchData(0);
};

// Call the main entry point
load();