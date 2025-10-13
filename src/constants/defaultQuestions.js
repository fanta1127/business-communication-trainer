// src/constants/defaultQuestions.js

/**
 * API失敗時のフォールバック質問
 * 各場面ごとに3問の汎用的な質問を用意
 */
export const DEFAULT_QUESTIONS = {
    'weekly-report': [
      'その課題の具体的な影響範囲を教えてください（誰が、いつまでに影響を受けますか？）',
      '解決のために必要なリソースやサポートは何ですか？',
      '次週までの具体的なアクションプランを教えてください',
    ],
    'project-proposal': [
      '提案の実現に必要な予算とリソースの概算を教えてください',
      '想定されるリスクと、その対策について教えてください',
      'このプロジェクトの成功をどのように測定しますか？',
    ],
    'problem-solving': [
      'この問題が発生した根本的な原因は何だと考えていますか？',
      'これまでに試した対策と、その結果を教えてください',
      '理想的な解決状態とは、具体的にどのような状態ですか？',
    ],
    'customer-presentation': [
      '競合他社と比較した際の、御社の強みは何ですか？',
      '導入後、どのくらいの期間で効果が現れると見込んでいますか？',
      '導入時のサポート体制について教えてください',
    ],
  };
  
  /**
   * 場面IDからデフォルト質問を取得
   * @param {string} sceneId - 場面ID
   * @returns {Array} デフォルト質問の配列（3問）
   */
  export const getDefaultQuestions = (sceneId) => {
    return DEFAULT_QUESTIONS[sceneId] || DEFAULT_QUESTIONS['weekly-report'];
  };
  
  /**
   * デフォルト質問が存在する場面IDかチェック
   * @param {string} sceneId - 場面ID
   * @returns {boolean}
   */
  export const hasDefaultQuestions = (sceneId) => {
    return sceneId in DEFAULT_QUESTIONS;
  };