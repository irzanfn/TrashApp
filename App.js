/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

 import React, { useEffect, useState } from 'react';
 import {
   StyleSheet,
   Text,
   View,
   Image,
   TouchableOpacity,
   LogBox,
   SafeAreaView
 } from 'react-native';
 
 
 import {launchCamera, launchImageLibrary} from 'react-native-image-picker';
 import * as tf from '@tensorflow/tfjs';
 import { bundleResourceIO, fetch, decodeJpeg } from '@tensorflow/tfjs-react-native';
 import * as jpeg from 'jpeg-js';
 import * as FileSystem from 'expo-file-system';
 import Camera from './components/Camera';
import { round } from '@tensorflow/tfjs';

 const App = () => {

  
   
   const [sourceImage,setSourceImage] = useState("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAQMAAADCCAMAAAB6zFdcAAAAYFBMVEXa2tpVVVXd3d1MTExSUlK2trZvb29LS0tTU1Ph4eGNjY2cnJzU1NRaWlpgYGBPT0+np6fGxsavr6/AwMCGhoZqamrOzs51dXWUlJSioqJ+fn7IyMhkZGTBwcG0tLREREQ0AqeBAAAClklEQVR4nO3b63KqMBRAYUiiSbyhKIqXtu//lgcUBRTOFGGm42Z9/5oK06wyQFCDAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAwCmpAfz2X96hjMh2O/+vpvEXNrTNDcZ/aIAqHQwMa0EBCA2O1fZeOtBPQIEonfWxXAhro2Pe5N/IrJ6DButefL6RBr/tcEQ2ijg2elgbja6DUVxzvqxuMroHaTLMLqdlVhsbWQJ2duZ5CDuXY6BocijtLW24ztgb7+821m461gZro++pgKbrB/4J8PRqsJDdQk1NrBRUUa4Mw2j2mLLFBYmet01Hrn9vpwO0FHwcq1qFO2yOkNnKRDiflK+Q1CC7ZjPS8PcJ2l0zTvS83EddAHa9nPXtsj6C899Ulg7gGwfI2ofyZQu2l7XuR1sCnUfFkzMbVOaltewRpDRb3y3/ozKQy7UV4aj0UhDXwu8qDZlv+77PxKFm0RJDVQJ11mSA0y/Nj3GY/XvbNEYQ1ONXebzCmmLU/5AtmE20bpymqgfqyYY1ZXSOo79vhYVzcNE9RDfzUhM8RFvkvikm23DZIalBZGD/kZ0I1L8f17PWcIKlBkLiXBqFJgkVl2OnXa6SgBn7d+AZsdNrVxq9HRm0vghqosOEwyI+EpzRmtZHawB9fzwbNTHXhHEhqsFj+MkG+Qe0aKaaB2vz2MMjZ1JenRjkNzp0+kqJ3Ap+hqE23j+Xow2MJJafBOWq+LLRwOltCFbeXYhps3LKr7W0vYhpkF4bubnsR1OBtNBDTwPdyEdDAHWZ9pMUd5kc3yJZFvYQSGgyDBjSgwUc3SH/0UKz+zAbB5rvXp/Zr4g/9ch/fbwQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACAbv4BqeU7MkrRIMQAAAAASUVORK5CYII=");
   const [TrashClassification,setTrashCLassification] = useState("");
   const [predictModel,setPredictModel] = useState("");
   const [probability,setProbability] = useState("");

   const Trash = ["non-organic", "organic", "recycleable"];
 
   useEffect(()=>{
 
     async function loadModel() {
       const backend = tf.setBackend('cpu');
       const tfReady = await tf.ready();
       console.log("[+] Loading custom image classification model")
       const modelJSON = await require("./assets/model_sampah/model.json");
       const modelWeight = await require("./assets/model_sampah/group1-shard.bin");
      
       console.log(modelWeight);
       console.warn(modelWeight);
       console.log(modelJSON);
      const TrashClassification = await tf.loadLayersModel(bundleResourceIO(modelJSON,modelWeight));
      //  console.log(TrashClassification);
       console.log("[+] Loading pre-trained image classification model")
       setTrashCLassification(TrashClassification);
     }
 
     loadModel();
   },[]);


  const getImage = async () => {
    const fileUri = sourceImage;      
    const imgB64 = await FileSystem.readAsStringAsync(fileUri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    const imgBuffer = tf.util.encodeString(imgB64, 'base64').buffer;
    const raw = new Uint8Array(imgBuffer) ;
    const imageTensor = decodeJpeg(raw).resizeBilinear([224,224]).reshape([1,224,224,3]);
    const predict_model = await TrashClassification.predict(imageTensor).data()
    
    let results = Array.from(predict_model)
        .map((proba, index) => {
          return { probability: proba, trueClass: Trash[index] };
        })
        .sort((a, b) => {
          return b.probability - a.probability;
        })
        .slice(0, 1);


      setPredictModel(results[0].trueClass);
      setProbability(results[0].probability * 100);

    console.log(sourceImage);
    console.log(imgBuffer);
    console.log(imageTensor);
    console.log(results[0]);
    // console.log(raw);

  }
 
   const PickImage = () => {
 
     const options = {
       mediaType : 'photo',
     };
 
     launchImageLibrary({options},(response) => {
       if (response.didCancel) {
         console.log('User cancelled image picker');
       } else if (response.errorMessage) {
         console.log('Image Picker Error: ', response.errorMessage);
       } else {
         let source = response.assets[0].uri;
         // console.log(source);
         // console.log(response.data);
         //console.log(response.assets[0].uri);
         console.log(TrashClassification);
         console.log(source);
         setSourceImage(source);
         
        //  setPic(response.uri);
       }
     })
   }
 
   const LaunchingCamera = () => {
 
     const options = {
       mediaType : 'video',
     };
 
     launchCamera({options},(response) => {
       if (response.didCancel) {
         console.log('User cancelled image picker');
       } else if (response.errorMessage) {
         console.log('Image Picker Error: ', response.errorMessage);
       } else {
         let source = response.assets[0].uri;
         
         setSourceImage(source);
        //  setPic(response.uri);
       }
     })
   }

   console.log(sourceImage);

   const reset = () => {
     setSourceImage("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAQMAAADCCAMAAAB6zFdcAAAAYFBMVEXa2tpVVVXd3d1MTExSUlK2trZvb29LS0tTU1Ph4eGNjY2cnJzU1NRaWlpgYGBPT0+np6fGxsavr6/AwMCGhoZqamrOzs51dXWUlJSioqJ+fn7IyMhkZGTBwcG0tLREREQ0AqeBAAAClklEQVR4nO3b63KqMBRAYUiiSbyhKIqXtu//lgcUBRTOFGGm42Z9/5oK06wyQFCDAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAwCmpAfz2X96hjMh2O/+vpvEXNrTNDcZ/aIAqHQwMa0EBCA2O1fZeOtBPQIEonfWxXAhro2Pe5N/IrJ6DButefL6RBr/tcEQ2ijg2elgbja6DUVxzvqxuMroHaTLMLqdlVhsbWQJ2duZ5CDuXY6BocijtLW24ztgb7+821m461gZro++pgKbrB/4J8PRqsJDdQk1NrBRUUa4Mw2j2mLLFBYmet01Hrn9vpwO0FHwcq1qFO2yOkNnKRDiflK+Q1CC7ZjPS8PcJ2l0zTvS83EddAHa9nPXtsj6C899Ulg7gGwfI2ofyZQu2l7XuR1sCnUfFkzMbVOaltewRpDRb3y3/ozKQy7UV4aj0UhDXwu8qDZlv+77PxKFm0RJDVQJ11mSA0y/Nj3GY/XvbNEYQ1ONXebzCmmLU/5AtmE20bpymqgfqyYY1ZXSOo79vhYVzcNE9RDfzUhM8RFvkvikm23DZIalBZGD/kZ0I1L8f17PWcIKlBkLiXBqFJgkVl2OnXa6SgBn7d+AZsdNrVxq9HRm0vghqosOEwyI+EpzRmtZHawB9fzwbNTHXhHEhqsFj+MkG+Qe0aKaaB2vz2MMjZ1JenRjkNzp0+kqJ3Ap+hqE23j+Xow2MJJafBOWq+LLRwOltCFbeXYhps3LKr7W0vYhpkF4bubnsR1OBtNBDTwPdyEdDAHWZ9pMUd5kc3yJZFvYQSGgyDBjSgwUc3SH/0UKz+zAbB5rvXp/Zr4g/9ch/fbwQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACAbv4BqeU7MkrRIMQAAAAASUVORK5CYII=");
     setPredictModel("");
   }
 
    return (
      <View style={styles.container}>
        <Text style={styles.text}>Trash Image Classification App</Text>
        <Text style={styles.text2}>Trash Available to predict : non-organic, organic, and recycleable</Text>
 
         <Image source={{uri: sourceImage}} style = {{height:224, width:224}} />
         <Text style={{fontWeight:'bold',fontSize:20}}> {predictModel} </Text>

         <View>
           <View style={{position:'absolute'}}>
             <TouchableOpacity  style={styles.button} onPress={LaunchingCamera}>
               <Text style={{color:'#fff'}}>Launch Camera</Text>
             </TouchableOpacity>
           </View>
           <View style={{position:'relative',marginLeft:200}}>
             <TouchableOpacity  style={styles.button} onPress={PickImage}>
               <Text style={{color:'#fff',textAlign:'left'}}>Choose Image</Text>
             </TouchableOpacity>
           </View>
         </View> 
 
         <View>
           <View style={{position:'absolute'}}>
             <TouchableOpacity  style={styles.button3} onPress={getImage}>
               <Text style={{color:'#fff'}}>Predict</Text>
             </TouchableOpacity>
           </View>
 
           <View style={{position:'relative',marginLeft:200}}>
             <TouchableOpacity  style={styles.button2} onPress={reset}>
               <Text style={{color:'#fff'}}>Reset</Text>
             </TouchableOpacity>
           </View>
         </View>
             
      </View>
 
       // <SafeAreaView styles={{flex:1}}>‍
       //   <Camera />‍
       // </SafeAreaView>
    );
   
   
 };
 
 const styles = StyleSheet.create({
   container: {
     flex: 1,
     justifyContent: 'center',
     alignItems: 'center',
     backgroundColor: '#F5FCFF',
   },
   text: {
     fontSize : 24,
     textAlign: 'center',
     margin: 10,
     fontWeight:'bold'
   },
   text2: {
    fontSize : 12,
    textAlign: 'center',
    margin: 5,
  },
   button : {
     backgroundColor: 'orange',
     margin: 10,
     padding : 10,
   },
   button2 : {
    backgroundColor: 'orange',
    width:110,
    margin: 10,
    padding : 10,
    alignItems: 'center',
  },
  button3 : {
    backgroundColor: 'orange',
    width:118,
    margin: 10,
    padding : 10,
    alignItems: 'center',
  },
 });
 
 export default App;
 