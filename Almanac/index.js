import React, {Component} from 'react'
import AlmanacController from '../AlmanacController'
import SimpleDatePicker from './SimpleDatePicker'
const ABSOLUTE_HEIGHT = 330;
class Almanac extends Component {
  constructor(props) { // gives us acces to props, fires long before page load
    super(props) // assigns props to this.props
    this.affiliate = props.affiliate;
    this.almanac = new AlmanacController(props.affiliate);
    this.state = {
      date: new Date().getTime(),
      lowest: -20,
      highest: 120,
      transition: '',
      labels: [],
      scale: 2,
      ticks: []
    }
    this.months = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'November',
      'October',
      'December'
    ]
    this.transition = ''
  }

  componentDidMount() {
    this.almanac.get((data) => {
      this.setState(data, this.optimizeScale)
      setTimeout(() => {
        this.setState({transition: 'all 600ms ease-in-out'})
      }, 600)
    })
  }

  createLabels() {
    var data = this.state;
    var labels = [
      {
        name: 'Average Low',
        value: data.averageLow
      }, {
        name: 'Average High',
        value: data.averageHigh
      }, {
        name: 'Actual Low',
        value: data.low,
        bold: true
      }, {
        name: 'Actual High',
        value: data.high,
        bold: true
      }, {
        name: `Record Low in ${data.recordLowYear}`,
        value: data.recordLow
      }, {
        name: `Record High in ${data.recordHighYear}`,
        value: data.recordHigh
      }
    ]

    labels = labels.map((label) => {
      label.bottom = this.project(label.value)
      label.rawBottom = label.bottom;
      return label
    })
    labels.sort(function(a, b) {
      return a.bottom - b.bottom
    })
    labels = this.spaceOut(labels)
    labels = this.spaceOut(labels)
    labels = this.spaceOut(labels)
    labels = this.spaceOut(labels)
    return labels
  }

  spaceOut(labels) {
    for (var i = 1; i < labels.length; i++) {
      let diff = labels[i].bottom - labels[i - 1].bottom
      if (diff < 16) {
        if (labels[i - 1].bottom > 70)
          labels[i - 1].bottom = labels[i - 1].bottom - 4
        labels[i].bottom = labels[i].bottom + 4
      }
    }
    return labels
  }

  optimizeScale() {
    var scale = ABSOLUTE_HEIGHT * 0.9 / (this.state.recordHigh - this.state.recordLow)
    var ticks = [];
    var start = Math.ceil(this.state.recordLow / 10) * 10;
    var end = Math.ceil(this.state.recordHigh / 10) * 10;

    for (var i = start; i < end; i = i + 10) {
      ticks.push(i)
    }
    this.setState({scale: scale, ticks: ticks})
  }

  handleDayChange = (d) => {
    this.almanac.changeDate(d.date, (data) => {
      this.setState(data, this.optimizeScale);
    })
  }

  disabledDays(d) {
    if (d.getTime() > Date.now())
      return true;
    return false;
  }

  project(temp) {
    return Math.round((temp - this.state.lowest) * this.state.scale);
  }

  projectPrecip(val) {
    var max = 54
    return Math.round(200 * (val) / 54)
  }

  placeHolder() {
    var date = new Date(this.state.date)
    let yyyy = date.getFullYear();
    let mm = date.getMonth() + 1;
    let dd = date.getDate();
    let s = `${yyyy}-${mm}-${dd}`;
    return s
  }
  render() {
    if (!this.state.high) {
      return null
    }
    return (
      <div className='gnm-almanac' style={{
        transition: this.state.transition
      }}>
        <div className='row'>
          <div className='col-xs-12'>
            <h2 className='title pull-left'>Climate Data for {this.state.city}, {this.state.state}
              on
            </h2>
            <div className='pull-left'>
              <SimpleDatePicker defaultTime={this.state.date} onDayChange={this.handleDayChange} />
            </div>
          </div>
        </div>
        <div className='row'>
          <div className='col-xs-6 col-xs-6-extra-small'>
            <h2 >
              Temperature</h2>
            <div style={{
              height: ABSOLUTE_HEIGHT + 5 + 'px',
              overflow: 'hidden',
              position: 'relative',
              left: '-20px',
              width: '280px'
            }}>
              <div className='temperature-graph' style={{
                bottom: -this.state.lowest - this.project(this.state.recordLow) - 5 + 'px'
              }}>
                <div className='range' style={{
                  height: Math.round(this.state.highest - this.state.lowest) * this.state.scale
                }}>
                  <div className='bottom-cover' style={{
                    height: this.project(this.state.recordLow) + 'px'
                  }} />
                  <div className='top-cover' style={{
                    bottom: this.project(this.state.recordHigh) + 'px',
                    height: this.project(this.state.highest) - this.project(this.state.recordHigh) + 'px'
                  }} />
                </div>
                <div className='numberline'>
                  <div className='axis' style={{
                    height: this.project(this.state.recordHigh) - this.project(this.state.recordLow) + 1 + 'px',
                    bottom: this.project(this.state.recordLow) + 'px'
                  }} /> {this.state.ticks.map((val, i) => {
                    return (
                      <div className='ticks' key={i} style={{
                        bottom: this.project(val) + 'px'
                      }}>
                        <span>{val}</span>
                      </div>
                    )
                  })}
                  {this.createLabels().map((label, i) => {
                    let height = Math.abs(label.rawBottom - label.bottom)
                    if (isNaN(height))
                      return null
                    let path = `M 0 0 H 30 L 50 ${height} L 60 ${height}`
                    return (
                      <div key={i} className='labels'>
                        <span className={'typical ' + (label.bold
                          ? 'bold'
                          : '')} style={{
                          bottom: label.bottom + 'px'
                        }}>
                          <span>{label.value}</span>
                          {label.name}
                        </span>
                        <svg height='4' width='60' xmlns='http://www.w3.org/2000/svg' style={{
                          bottom: label.rawBottom
                        }}>
                          <line x1='0' y1='4' x2='30' y2='4' strokeWidth={label.bold
                            ? 4
                            : 2} stroke='black' strokeLinejoin='round'/>
                        </svg>
                      </div>
                    )
                  })}
                </div>
              </div>

            </div>
          </div>
          <div className='col-xs-6 col-xs-6-extra-small'>
            <h2>Precipitation</h2>
            <div className=' rainfall' style={{
              height: Math.round(ABSOLUTE_HEIGHT * 0.9)
            }}>
              <div className='rain-gauge'>
                <div className='today-precip' style={{
                  display: this.state.precip > 0
                    ? 'block'
                    : 'none'
                }}>
                  <span className={'fa ' + (this.state.snow
                    ? 'fa-snowflake-o'
                    : 'fa-tint')}></span>
                  <span className={'fa ' + (this.state.snow
                    ? 'fa-snowflake-o'
                    : 'fa-tint')}></span>
                  <span className={'fa ' + (this.state.snow
                    ? 'fa-snowflake-o'
                    : 'fa-tint')}></span>
                  <div>{(this.state.snow
                      ? this.state.snow
                      : this.state.precip) + '"'}</div>
                  <div className='snow-depth' style={{
                    display: (this.state.snow
                      ? 'inline'
                      : 'none')
                  }}>Snow Depth</div>
                </div>
                <div className='today-precip' style={{
                  display: this.state.precip > 0
                    ? 'none'
                    : 'block'
                }}>
                  None
                </div>
                <div className='fill' style={{
                  height: this.projectPrecip(this.state.precipYTD)
                }}></div>
                <div className='indicator' style={{
                  bottom: Math.max(30, Math.min(135, this.projectPrecip(this.state.precipYTD) - 35)) + 'px'
                }}>
                  {this.state.precipYTD + '"'}
                  YTD
                </div>
                <div className='indicator record' style={{
                  bottom: this.projectPrecip(48) + 'px'
                }}>
                  <span>{'48" Record'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

}

export default Almanac
