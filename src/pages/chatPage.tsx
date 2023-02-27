import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Dimensions,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import axios from 'axios';
import Config from 'react-native-config';
import Lottie from 'lottie-react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import storage from '../storage/storage';
import ChatService from '../services/chatService';

const window = Dimensions.get('window');

export default function ChatPage() {
  const [data, setData] = useState([]);
  const [input, setInput] = useState<string>();
  const [bool, setBool] = useState<boolean>();
  const [loading, setLoading] = useState<boolean>(false);
  const [userInfo, setUserInfo] = useState();

  const chatServices = new ChatService();

  const messageData: {
    message: string;
    user: string;
    date: string;
    messageData: {
      message: string;
      user: string;
      date: string;
      response: string;
    };
  }[] = [];
  const ADRESS = Config.ADRESS;

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);

      await chatServices
        .getChatHistory()
        .then(resp => {
          resp.data.map(mes => messageData.push(mes));
          setData(messageData.reverse());
        })
        .catch(error => console.log('error', error));

      storage
        .load({
          key: 'userInfo',
        })
        .then(async resp => {
          setUserInfo(resp);
          console.log('respaaa', userInfo);
        });
      setLoading(false);
    };

    fetch();
  }, [bool]);

  const addArray = async () => {
    setBool(true);
    var items;
    if (userInfo.freeToken > 0 || userInfo.gptToken > 0) {
      const freeTokenCount = userInfo.freeToken;
      const gptTokenCount = userInfo.gptToken;

      // await axios
      //   .get(`${ADRESS}/messages/${input}`)
      //   .then(async item => {
      //     items = item.data;

      //     if (items) {
      //       if (freeTokenCount) {
      //         console.log('ftk', freeTokenCount);
      //         await axios.patch(`${ADRESS}/users/${userInfo.idToken}`, {
      //           freeToken: freeTokenCount - 1,
      //         });
      //       } else {
      //         await axios.patch(`${ADRESS}/users/${userInfo.idToken}`, {
      //           gptToken: gptTokenCount - 1,
      //         });
      //       }
      //     }
      //   })
      //   .catch(error => console.log('error', error));

      await chatServices
        .getGptAnswer(input, freeTokenCount, gptTokenCount, userInfo.idToken)
        .then(resp => {
          console.log('resp get', resp);
          items = resp;
        })
        .catch(error => {
          console.log('get error get', error);
        });

      // await axios
      //   .post(`${ADRESS}/messages`, {
      //     user: 'crazy_61',
      //     messageInfo: {
      //       message: `${input}`,
      //       user: 'crazy_61',
      //       response: `${items}`,
      //       date: '05.05.2010',
      //     },
      //   })
      //   .then(resp => {
      //     console.log('resp post', resp);
      //   })
      //   .catch(error => {
      //     console.log('error post', error);
      //   });

      await chatServices
        .senMessage(userInfo.user.id, input, items)
        .then(resp => {
          console.log('resp post', resp);
        })
        .catch(error => {
          console.log('error post', error);
        });

      await chatServices
        .getChatHistory()
        .then(resp => {
          console.log('newservice', resp);
          messageData.push(resp);
        })
        .catch(error => console.log('error', error));
      // await axios
      //   .get(`${ADRESS}/messages`)
      //   .then(item => {
      //     const messages = item.data;
      //     messageData.push(messages);
      //   })
      //   .catch(error => console.log('error', error));
    } else {
      console.log('Token Bulunamamaktadır');
    }
    setInput('');
    setBool(false);
  };

  return (
    <View style={styles.container}>
      <View style={styles.loadingView}>
        {loading ? (
          <Lottie
            source={require('../assets/animations/messageLoad.json')}
            style={styles.animationLoading}
            autoPlay
            loop
          />
        ) : null}
      </View>
      <FlatList
        inverted
        extraData={data}
        data={data}
        refreshing={bool}
        renderItem={({item}) => (
          <>
            <View style={styles.messageSection}>
              <Text style={styles.sendedSection}>
                {item.messageInfo.message}
              </Text>
              <Text style={styles.responsSection}>
                {item.messageInfo.response}
              </Text>
            </View>
          </>
        )}
      />
      <View style={{alignItems: 'center'}}>
        {bool ? (
          <Lottie
            source={require('../assets/animations/messageLoad.json')}
            style={styles.animation}
            autoPlay
            loop
          />
        ) : null}
      </View>
      <View style={styles.sendMessageSection}>
        <TextInput
          style={styles.input}
          onChangeText={(text: string) => setInput(text)}
          value={input}
          placeholder="Message..."
          multiline
        />
        <TouchableOpacity
          style={styles.sendMessageButton}
          onPress={() => addArray()}>
          <Icon name="send-o" size={20} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  messageSection: {
    margin: 5,
  },
  sendedSection: {
    backgroundColor: '#E0ECFF',
    marginLeft: window.width / 3,
    marginRight: window.width / 20,
    padding: 15,
    marginVertical: 5,
    borderRadius: 10,
  },
  responsSection: {
    backgroundColor: '#E9EEF8',
    marginRight: window.width / 3,
    marginLeft: window.width / 20,
    padding: 15,
    marginVertical: 5,
    borderRadius: 10,
  },
  animation: {
    width: window.width / 20,
    height: window.height / 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingView: {
    alignItems: 'center',
    justifyContent: 'flex-end',
    flex: 1,
  },
  animationLoading: {
    width: window.width / 12,
    height: window.height / 12,
  },
  sendMessageSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  input: {
    height: 48,
    width: window.width / 1.25,
    marginHorizontal: 12,
    borderWidth: 1,
    padding: 10,
    borderColor: '#D6DAE2',
    borderRadius: 4,
  },
  sendMessageButton: {
    alignItems: 'center',
    justifyContent: 'center',
    width: window.width / 8,
    height: 48,
    borderWidth: 1,
    borderColor: '#D6DAE2',
    borderRadius: 4,
  },
  sendIcon: {},
});
