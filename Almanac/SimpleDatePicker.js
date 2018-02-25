import React, {Component} from 'react'

class SimpleDatePicker extends Component {
  constructor(props) {
    super(props)
    var initTime = this.props.defaultTime || new Date().getTime()
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
    this.years = [
      2018,
      2017,
      2016,
      2015,
      2014,
      2013,
      2012,
      2011,
      2010
    ]
    this.state = {
      month: new Date(initTime).getMonth(),
      day: new Date(initTime).getDate(),
      year: new Date(initTime).getFullYear()
    }
    this.days = [];
    this.notAfter = new Date()
    this.onDayChange = this.props.onDayChange || function(d) {
      console.log('returned date', d)
    };
  }

  componentWillUpdate(nextProps, nextState) {
    let total = new Date(nextState.year, nextState.month + 1, 0).getDate()
    let days = []
    for (var i = 1; i <= total; i++) {
      days.push(i)
    }
    this.days = days;
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (new Date(nextState.year, nextState.month, nextState.day).getTime() > this.notAfter.getTime())
      return false
    return true
  }

  changeMonth = (e) => {
    let month = e.target.value
    this.setState({
      month: parseInt(month, 10)
    })
  }

  changeDay = (e) => {
    let day = e.target.value
    this.setState({
      day: parseInt(day, 10)
    })
  }

  changeYear = (e) => {
    let year = e.target.value
    this.setState({
      year: parseInt(year, 10)
    })
  }

  componentDidUpdate = (prevProps, prevState) => {
    if (this.state == prevState)
      return
    let val = Object.assign({}, this.state)
    val.date = new Date(this.state.year, this.state.month, this.state.day)
    this.onDayChange(val)
  }

  render() {
    return (
      <div className="gnm-simple-date-picker">
        <select name="Month" defaultValue={this.state.month} onChange={this.changeMonth}>
          {this.months.map((month, i) => {
            return <option key={i} value={i}>{month}</option>
          })}
        </select>

        <select name="Day" defaultValue={this.state.day} onChange={this.changeDay}>
          {this.days.map((day, i) => {
            return <option key={i} value={day}>{day}</option>
          })}
        </select>
        <select name="Year" defaultValue={this.state.year} onChange={this.changeYear}>
          {this.years.map((year, i) => {
            return <option key={i} value={year}>{year}</option>
          })}
        </select>
      </div>

    )
  }

}

export default SimpleDatePicker
