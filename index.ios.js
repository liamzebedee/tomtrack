/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 */
 // 'use strict';
 import React, {
  AppRegistry,
  Component,
  StyleSheet,
  Text,
  TextInput,
  View,
  TouchableOpacity,
  AsyncStorage
} from 'react-native';

var TimerMixin = require('react-timer-mixin');
var moment = require('moment')


function ValidURL(str) {
  return /^(http|https):\/\//.test(str);
}

class tomtrack extends Component {
  constructor(props) {
    super(props)
    this.state = {
      endpoint: 'https://mywebsite.com/endpoint/',
      endpointTmp: '',
      lastLoc: null
    };
  }

  componentDidMount() {
    this._loadInitialState().done();
    this._tickGetLocation.bind(this)()
    // var watch = navigator.geolocation.watchPosition(self._handleLocation, (error) => this.setState({serverContactError: error.message }), geoOpt);
  }

  async _loadInitialState() {
    try {
      var value = await AsyncStorage.getItem('endpoint');
      if (value !== null) {
        this.setState({endpoint: value, endpointTmp: value });
      }
    } catch (error) {
      alert(error)
    }
  }

  _tickGetLocation() {
    var handleLocation = this._handleLocation.bind(this)
    TimerMixin.setTimeout(function(){
      const geoOpt = {enableHighAccuracy: false, timeout: 7500, maximumAge: 5000, accuracy: 0.0001 };
      navigator.geolocation.getCurrentPosition(handleLocation, (error) => alert(error.message), geoOpt);
    }, 1000);
  }

  _handleLocation(location) {
      /* Example location returned
        {
          coords: {
            speed: -1,
            longitude: -0.1337,
            latitude: 51.50998,
            accuracy: 5,
            heading: -1,
            altitude: 0,
            altitudeAccuracy: -1
          },
          timestamp: 1446007304457.029
        }
        */
        
        this.setState({ lastLoc: location })

        fetch(this.state.endpoint, {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(location)
        }).then(() => this.setState({ lastServerContact: new Date, serverContactError: null })
        ).catch((error) => this.setState({ serverContactError: error.message }))


    this._tickGetLocation.bind(this)()
  }

  _saveNewEndpoint() {
    if(!ValidURL(this.state.endpointTmp)) {
      return alert("You forgot to add the protocol (http[s]://) to the API endpoint");
    }
    this.setState({ endpoint: this.state.endpointTmp })
    try {
      AsyncStorage.setItem('endpoint', this.state.endpoint);
      alert('Saved!')
    } catch (error) {
      alert(error)
    }
  }

  render() {
    var info;
    if(this.state.lastLoc) {
      var lastUpdated = moment(this.state.lastLoc.timestamp).format('LTS')
      var lastServerContact;
      if(this.state.lastServerContact) {
        lastServerContact = 'at ' + moment(this.state.lastServerContact).format('LTS');
      } else lastServerContact = 'never';

      info = <Text style={styles.text}>
        <Text>Last update at {lastUpdated} with ({this.state.lastLoc.coords.latitude}, {this.state.lastLoc.coords.longitude})</Text>{"\n"}{"\n"}
        <Text>Last server contact: {lastServerContact} <Text style={{ color: 'red' }}>{this.state.serverContactError}</Text></Text>
      </Text>;
    } else {
      info = <Text style={styles.text}>Getting location...</Text>;
    }

    return (
      <View style={styles.container}>

        <View style={styles.endpointInput}>
          <TextInput autoCapitalize={'none'} autoCorrect={false} autoFocus={false} onChangeText={(endpointTmp) => this.setState({endpointTmp})} value={this.state.endpointTmp} style={styles.endpointInputText} placeholder={"http://some-fantastic-website.com/api/location"}/>
          <TouchableOpacity onPress={this._saveNewEndpoint.bind(this)}><Text style={{fontSize: 28}}>Save</Text></TouchableOpacity>
        </View>

        <View style={styles.info}>{info}</View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    margin: 25
  },
  
  info: {
    flex: 1
  },

  endpointInput: {
    paddingBottom: 20
  },
  endpointInputText: {
    height: 32,
    fontSize: 16
  },
  text: {
    fontSize: 20,
    margin: 10
  }
});


AppRegistry.registerComponent('tomtrack', () => tomtrack);


