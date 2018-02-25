import XML2JS from 'xml2js';
import ZipController from './ZipController';

const dayArr = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const monthArr = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August',
  'September', 'October', 'November', 'December'];


class ForecastController{
  constructor(affiliate){
    this.stationID = affiliate == 'kotv' ? 1 : 2
    /* the WDT feed this originates at is documented at http://wdtinc.com/skywise-home/current-forecast-documentation/

    another fun one https://wdtinc.com/skywise-home/tiles-documentation/
    interesting additional feed here http://current-at-point-2-xml.feeds.wdtinc.com/feeds/news9/currentAtPoint2Xml.php?ZIP=76354
    http://weather.wdtinc.com/feeds/news9/worldForecast2Xml.php?ZIP=76354
    http://stan-hourly.feeds.wdtinc.com/feeds/news9/hourlyForecast2Xml.php?ZIP=76354
    http://weather.wdtinc.com/feeds/news9/health.php?ZIP=76354

    action = WxForecast2012

    */
    this.zips = new ZipController(affiliate)
    this.feedUrl = `https://kotv.com/api/GetForecast.ashx?target=data&action=WxForecast2012&site=${this.stationID}&zip=`;
    this.hasLocalStorage = this.hasLocalStorage();
    this.cacheDuration = 1000 * 3 * 60;

  }

  hasLocalStorage(){
    let uid = new Date();
      try {
          localStorage.setItem(uid, uid);
          localStorage.removeItem(uid);
          return true;
      } catch (e) {
        return false;
      }
  }

  Ajax(url) {
    return new Promise(function(resolve, reject) {
      let req = new XMLHttpRequest();
      req.open('GET', url);
      req.onload = function() {
        if (req.status === 200) {
          resolve(req.response);
        } else {
          reject(new Error(req.statusText));
        }
      };
      req.onerror = function() {
        reject(new Error('Network error'));
      };
      req.send();
    });
  }

  get(callback){
    if(this.hasLocalStorage)
      if(localStorage.getItem('forecastData') && localStorage.getItem('forecastDataTimestamp'))
        if( Date.now() < parseInt(localStorage.getItem('forecastDataTimestamp'),10) + this.cacheDuration ){
          callback( JSON.parse(localStorage.getItem('forecastData')))
          return;
        }
    this.fetch(callback)
  }

  fetch(callback){
    this.Ajax(this.feedUrl + this.zips.get()[0] + '&usingForecastController=true').then((data)=>{
      let forecastData = this.convertToJson(data)
      localStorage.setItem('forecastData', JSON.stringify(forecastData))
      localStorage.setItem('forecastDataTimestamp', Date.now())
      callback( forecastData )
    })
  }



  convertToJson(forecastdata){
    function formatIcon(icon){
      if (icon.indexOf('/') > -1){
        return icon.split('/')[1];
      } else {
        return icon;
      }
    }

    let forecasts = [];
    let jsondata;
    XML2JS.parseString(forecastdata,
      {
        attrNameProcessors: [(name => `@${name}`)],
        explicitArray: false,
        charkey: "#text",
        mergeAttrs: true
      },
      (err, result) => {
        jsondata = result;
      }
    );
    let maindata = jsondata["WxSources"];

    let currentdata = maindata["conditions"]["sfc_ob"];
    let UTCtime = currentdata["ob_time"];
    let dateArr = UTCtime.split(' ')[0].split('-')
    let localtime = new Date()
    localtime.setFullYear(dateArr[0])
    localtime.setMonth(dateArr[1]-1)
    localtime.setDate(dateArr[2])
    let updatedtime = `
      ${dayArr[localtime.getDay()]},
      ${monthArr[localtime.getMonth()]} ${localtime.getDate()},
      ${localtime.getFullYear()}
    `;
    let localtemp = currentdata["temp"]["#text"];
    let tmpThis = this;
    let normFormat = true;

    if (typeof maindata["forecast"]["WxForecasts"] !== 'undefined'){ //kwtv
      forecastdata = maindata["forecast"]["WxForecasts"]["WxForecast"];

    } else { //kotv
      forecastdata = maindata["forecast"]["forecast"]["daily_summary"];
      normFormat = false;

    }

    window.teststuff = jsondata;
    let iconUrl = 'http://ftpcontent.worldnow.com/griffin/gnm/testing/svg/day/';
    for (let i = 0, len = forecastdata.length; i < len; i += 1){
      let curForecast = forecastdata[i];
      let fullDate;
      let dateStr = '';
      if (normFormat){
        fullDate = new Date(curForecast["@Date"]);
        dateStr = `
          ${dayArr[fullDate.getUTCDay()]},
          ${monthArr[fullDate.getMonth()].substring(0, 3)} ${fullDate.getDate()},
          ${fullDate.getFullYear()}
        `;
      }
      let tmpObj = {
          key: i,
          id: normFormat ? curForecast["@WxForecastId"] : curForecast["summary_date"].replace('/', ''),
          date: normFormat ? dayArr[(new Date(curForecast["@Date"])).getUTCDay()] : dayArr[(new Date(curForecast["summary_date"])).getUTCDay()],
          condition: normFormat ? curForecast["Condition"].replace(/&amp;/g, '&') : curForecast["wx"].replace(/&amp;/g, '&'),
          conditionicon: normFormat ? `${iconUrl}${curForecast["@WxIconTypeAbbrev"]}.svg` : `${iconUrl}${formatIcon(curForecast["wx_icon_text"])}.svg`,
          low: normFormat ? curForecast["Low"] : curForecast["low"],
          high: normFormat ? curForecast["High"] : curForecast["high"],
          sunrise: normFormat ? curForecast["Sunrise"] : curForecast["sunrise"],
          sunset: normFormat ? curForecast["Sunset"] : curForecast["sunset"],
          description: normFormat ? curForecast["Description"] : '',
          windspeedmin: normFormat ? curForecast["WindSpeedMin"] : curForecast["wnd_spd"],
          windspeedmax: normFormat ? curForecast["WindSpeedMax"] : curForecast["wnd_spd"],
          winddirection: normFormat ? curForecast["WindDirection"] : curForecast["wnd_dir"],
          precipitation: normFormat ? `${curForecast["Precipitation"]}%` : `${curForecast["pop"]}%`,
          extendedTitle: `Outlook for ${dateStr}`,
          precipToggle: true
        };
      if (tmpObj.precipitation === '0%'){
        tmpObj.precipitation = '';
        tmpObj.precipToggle = false;
      }
      if (i < 9){
        forecasts.push(tmpObj);
      }
    }

    return{
      updated: updatedtime,
      city: currentdata["location"]["#text"],
      state: currentdata["location"]["@region"],
      conditionIcon: `http://ftpcontent.worldnow.com/griffin/gnm/testing/svg/day/${currentdata["WxIconType"]["#text"]}.svg`,
      temp: currentdata["temp"]["#text"],
      conditionText: currentdata["wx"],
      feelsLike: currentdata["apparent_temp"]["#text"],
      dew: currentdata["dewp"]["#text"],
      humidity: currentdata["rh"],
      visibility: parseInt(currentdata["visibility"]["#text"] / 5280, 10),
      windSpeed: currentdata["wnd_spd"]["#text"],
      windDirection: currentdata["wnd_dir"],
      pressure: currentdata["press"]["#text"],
      forecasts,
      hourly : maindata.hourly.locations.location.forecasts.hourly
    }
  }

}

export default ForecastController;
