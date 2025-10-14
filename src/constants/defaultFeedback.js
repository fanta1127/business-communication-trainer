// src/constants/defaultFeedback.js

/**
 * デフォルトフィードバック
 * OpenAI API失敗時のフォールバック用
 * 
 * 各場面ごとに建設的で実用的なフィードバックを提供
 */

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 汎用デフォルトフィードバック
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export const DEFAULT_FEEDBACK = {
    summary: "全体的によく整理されたプレゼンテーションでした。基本的な要素は押さえられています。",
    goodPoints: [
      {
        aspect: "構成",
        quote: "",
        comment: "論理的に構成されており、聞き手が理解しやすい流れになっていました"
      },
      {
        aspect: "姿勢",
        quote: "",
        comment: "前向きな姿勢が伝わり、課題に真摯に取り組んでいることが感じられました"
      }
    ],
    improvementPoints: [
      {
        aspect: "具体性",
        original: "",
        improved: "数値や具体的な事例を加えることで、より説得力が増します",
        reason: "抽象的な表現よりも、具体的なデータや実例の方が相手に伝わりやすく、信頼性も高まります"
      }
    ],
    encouragement: "次回も頑張ってください！継続的な練習が、確実にあなたのコミュニケーション力を向上させます。",
    source: "DEFAULT",
  };
  
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 場面別デフォルトフィードバック
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  export const DEFAULT_FEEDBACKS_BY_SCENE = {
    // 週次報告会議
    'weekly-report': {
      summary: "進捗報告として基本的な要素が含まれており、現状が把握できました。",
      goodPoints: [
        {
          aspect: "現状把握",
          quote: "",
          comment: "今週の進捗状況を明確に伝えようとする姿勢が良かったです"
        },
        {
          aspect: "課題認識",
          quote: "",
          comment: "直面している課題について言及されており、問題意識が伝わりました"
        }
      ],
      improvementPoints: [
        {
          aspect: "具体性",
          original: "進捗があります",
          improved: "全体の60%が完了しており、予定より2日遅れていますが、週末までにリカバリー可能です",
          reason: "数値や期限を明確にすることで、聞き手が状況を正確に理解でき、適切なサポートも受けやすくなります"
        },
        {
          aspect: "次のアクション",
          original: "対応します",
          improved: "明日午前中にチームミーティングを開き、木曜までに解決策を決定します",
          reason: "具体的なアクションと期限を示すことで、計画性と実行力をアピールできます"
        }
      ],
      encouragement: "報告の基本はできています。次は数値や期限を意識して報告すると、さらに信頼性が高まります！",
      source: "DEFAULT",
    },
  
    // プロジェクト提案
    'project-proposal': {
      summary: "提案の骨組みは理解できました。アイデアの核心は伝わっています。",
      goodPoints: [
        {
          aspect: "目的の明確さ",
          quote: "",
          comment: "プロジェクトの目的を伝えようとする意識が感じられました"
        },
        {
          aspect: "必要性の認識",
          quote: "",
          comment: "なぜ今このプロジェクトが必要なのか、問題意識を持っていることが伝わりました"
        }
      ],
      improvementPoints: [
        {
          aspect: "期待効果",
          original: "効果があります",
          improved: "導入後3ヶ月で業務時間を20%削減でき、年間で約300万円のコスト削減が見込めます",
          reason: "定量的な効果を示すことで、投資対効果が明確になり、承認を得やすくなります"
        },
        {
          aspect: "実現可能性",
          original: "実施できます",
          improved: "既存システムとの連携は2週間で完了可能で、担当者3名で運用できます",
          reason: "具体的なリソースと期間を示すことで、提案の実現可能性が高まります"
        }
      ],
      encouragement: "良いアイデアです！次は数値で効果を示すと、さらに説得力のある提案になります。",
      source: "DEFAULT",
    },
  
    // 問題解決の議論
    'problem-solving': {
      summary: "問題の把握はできており、解決に向けた意識が感じられました。",
      goodPoints: [
        {
          aspect: "問題認識",
          quote: "",
          comment: "現在直面している問題について、しっかりと認識していることが伝わりました"
        },
        {
          aspect: "影響の理解",
          quote: "",
          comment: "問題が引き起こしている影響について言及しており、深刻度を理解していることが分かりました"
        }
      ],
      improvementPoints: [
        {
          aspect: "根本原因",
          original: "問題が発生しています",
          improved: "○○の手順が明文化されていないため、担当者によって対応が異なり、ミスが発生しています",
          reason: "根本原因を明確にすることで、表面的な対処ではなく、本質的な解決策を導き出せます"
        },
        {
          aspect: "対策の具体性",
          original: "改善します",
          improved: "手順書を作成し、全員で確認会を実施。1週間のトライアル後、正式運用を開始します",
          reason: "具体的なステップを示すことで、解決への道筋が明確になり、実行可能性が高まります"
        }
      ],
      encouragement: "問題の本質を見極めようとする姿勢が素晴らしいです。次は原因分析をさらに深めてみましょう！",
      source: "DEFAULT",
    },
  
    // 顧客へのプレゼン
    'customer-presentation': {
      summary: "お客様への提案として基本的な構成ができており、商品・サービスの魅力が伝わってきました。",
      goodPoints: [
        {
          aspect: "課題理解",
          quote: "",
          comment: "お客様の課題を理解し、それを解決しようとする姿勢が感じられました"
        },
        {
          aspect: "ソリューション提示",
          quote: "",
          comment: "提案する商品・サービスの特徴について説明されていました"
        }
      ],
      improvementPoints: [
        {
          aspect: "顧客メリット",
          original: "便利になります",
          improved: "御社の受注処理時間が現在の30分から5分に短縮でき、1日あたり約2時間の工数削減が実現します",
          reason: "顧客視点での具体的なメリットを数値で示すことで、導入後のイメージが明確になり、購買意欲が高まります"
        },
        {
          aspect: "差別化",
          original: "良い製品です",
          improved: "競合A社と比較して、導入コストが30%低く、サポート体制は24時間365日対応です",
          reason: "競合との明確な違いを示すことで、なぜ御社を選ぶべきなのかが明確になります"
        }
      ],
      encouragement: "お客様のことを考えた提案ができています。次は具体的な数値とメリットを強調すると、さらに響くプレゼンになります！",
      source: "DEFAULT",
    },
  };
  
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // ヘルパー関数
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  /**
   * 場面IDからデフォルトフィードバックを取得
   * @param {string} sceneId - 場面ID
   * @returns {Object} デフォルトフィードバック
   */
  export const getDefaultFeedback = (sceneId) => {
    return DEFAULT_FEEDBACKS_BY_SCENE[sceneId] || DEFAULT_FEEDBACK;
  };
  
  /**
   * デフォルトフィードバックが存在する場面IDかチェック
   * @param {string} sceneId - 場面ID
   * @returns {boolean}
   */
  export const hasDefaultFeedback = (sceneId) => {
    return sceneId in DEFAULT_FEEDBACKS_BY_SCENE;
  };
  
  /**
   * すべての場面IDを取得
   * @returns {Array<string>} 場面IDの配列
   */
  export const getAvailableSceneIds = () => {
    return Object.keys(DEFAULT_FEEDBACKS_BY_SCENE);
  };