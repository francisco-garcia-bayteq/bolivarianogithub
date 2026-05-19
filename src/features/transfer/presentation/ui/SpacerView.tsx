import {StyleSheet, View} from "react-native";
interface SpacerViewProps {
    height?:number
}
export const SpacerView =({height = 10}:Readonly<SpacerViewProps>)=>{
    return(
        <View
        style={[style.spacer,{height}]}
        />
    )
}

const style = StyleSheet.create({
    spacer:{
        width:10
    }
})
