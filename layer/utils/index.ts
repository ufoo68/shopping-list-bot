export const enum MessageType {
  Confirm,
  Clear,
  Add,
}

export interface DbHandlerEvent {
  messageType: MessageType,
  message: string,
  userId: string,
}

export interface DbHandlerEventResponse {
  items: string[],
}

interface ReplyModel {
  message: string,
  type: MessageType,
}

export const analyzeMessage = (message: string): ReplyModel => {
  switch (message) {
      case 'リスト確認':
          return { message: '現在の買い物リストです。', type: MessageType.Confirm }
      case 'リストをクリア':
          return { message: 'リストをクリアしました', type: MessageType.Clear }
      default:
          return { message: `${message}をリストに追加します。`, type: MessageType.Add }
  }
}