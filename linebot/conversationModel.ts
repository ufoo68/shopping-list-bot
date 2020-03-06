export enum MessageType {
    Confirm,
    Clear,
    Add,
}

interface ReplyModel {
    message: string,
    type: MessageType,
}

export const conversation = (message: string): ReplyModel => {
    switch (message) {
        case 'リスト確認':
            return { message: '現在の買い物リストです。', type: MessageType.Confirm }
        case 'リストをクリア':
            return { message: 'リストをクリアしました', type: MessageType.Clear }
        default:
            return { message: `${message}をリストに追加します。`, type: MessageType.Add }
    }
}