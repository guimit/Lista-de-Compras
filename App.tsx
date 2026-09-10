import 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { HistoricoProvider } from './src/hooks/useHistorico';
import { ShoppingListProvider } from './src/hooks/useShoppingList';
import DetalheCompraScreen from './src/screens/DetalheCompraScreen';
import HistoricoScreen from './src/screens/HistoricoScreen';
import HistoryScreen from './src/screens/HistoryScreen';
import HomeScreen from './src/screens/HomeScreen';
import { colors } from './src/theme';
import { RootStackParamList } from './src/types';

const Stack = createStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <HistoricoProvider>
          <ShoppingListProvider>
            <NavigationContainer>
              <StatusBar style="dark" />
              <Stack.Navigator
                screenOptions={{
                  headerStyle: { backgroundColor: colors.background },
                  headerTintColor: colors.primary,
                  headerTitleStyle: { fontWeight: '700', color: colors.text },
                  headerShadowVisible: false,
                  cardStyle: { backgroundColor: colors.background },
                }}
              >
                <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'Lista de Compras' }} />
                <Stack.Screen name="History" component={HistoryScreen} options={{ title: 'Frequentes' }} />
                <Stack.Screen
                  name="Historico"
                  component={HistoricoScreen}
                  options={{ title: 'Histórico' }}
                />
                <Stack.Screen
                  name="DetalheCompra"
                  component={DetalheCompraScreen}
                  options={{ title: 'Compra' }}
                />
              </Stack.Navigator>
            </NavigationContainer>
          </ShoppingListProvider>
        </HistoricoProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
