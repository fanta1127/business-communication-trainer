// src/screens/SceneSelectionScreen.js
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SceneSelectionScreen({ navigation }) {
  // 仮の場面データ（後でconstants/scenes.jsから読み込む）
  const scenes = [
    {
      id: 'weekly-report',
      name: '週次報告会議',
      icon: '📊',
      description: '進捗や課題を報告する場面',
    },
    {
      id: 'project-proposal',
      name: 'プロジェクト提案',
      icon: '💡',
      description: '新規プロジェクトを提案する場面',
    },
    {
      id: 'problem-solving',
      name: '問題解決の議論',
      icon: '🔧',
      description: 'チームで課題を議論する場面',
    },
    {
      id: 'customer-presentation',
      name: '顧客へのプレゼン',
      icon: '🎯',
      description: '顧客に提案する場面',
    },
  ];

  const handleSceneSelect = (scene) => {
    // PracticeScreenに遷移（場面データを渡す）
    navigation.navigate('Practice', { scene });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>練習する場面を選択</Text>
          <Text style={styles.subtitle}>
            ビジネスシーンに合わせた練習ができます
          </Text>
        </View>

        <View style={styles.scenesContainer}>
          {scenes.map((scene) => (
            <TouchableOpacity
              key={scene.id}
              style={styles.sceneCard}
              onPress={() => handleSceneSelect(scene)}
              activeOpacity={0.7}
            >
              <View style={styles.sceneIconContainer}>
                <Text style={styles.sceneIcon}>{scene.icon}</Text>
              </View>
              <View style={styles.sceneInfo}>
                <Text style={styles.sceneName}>{scene.name}</Text>
                <Text style={styles.sceneDescription}>
                  {scene.description}
                </Text>
              </View>
              <View style={styles.arrowContainer}>
                <Text style={styles.arrow}>›</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  scenesContainer: {
    padding: 16,
  },
  sceneCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  sceneIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  sceneIcon: {
    fontSize: 32,
  },
  sceneInfo: {
    flex: 1,
  },
  sceneName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  sceneDescription: {
    fontSize: 14,
    color: '#666',
  },
  arrowContainer: {
    padding: 8,
  },
  arrow: {
    fontSize: 24,
    color: '#999',
  },
});