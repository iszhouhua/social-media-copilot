import { TaskFileInfo, TaskProcessor } from "@/components/task";
import * as http from "@/platforms/dy/http";
import { FormSchema } from ".";

export class Processor extends TaskProcessor<FormSchema, http.comment.Comment[]> {

    async execute() {
        const { postIds, limitPerId } = this.condition;
        let total = postIds.length * limitPerId;
        this.actions.setTotal(total);
        let completed = 0;
        this.actions.setCompleted(completed);
        for (const awemeId of postIds) {
            const comments = await this.getAwemeComments(awemeId, limitPerId, completed);
            const count = this.getCommentCount(comments);
            total += count - limitPerId;
            completed += count;
            this.actions.setCompleted(completed);
            this.actions.setTotal(total);
            //将采集到的数据绑定在 data 上
            this.data[awemeId] = comments;
        }
    }


    async getFileInfos(): Promise<Array<TaskFileInfo>> {
        const { postIds } = this.condition;
        const dataList: any[][] = [[
            '评论ID',
            '视频ID',
            '视频链接',
            '用户ID',
            '抖音号',
            '用户名称',
            '用户主页',
            '评论内容',
            '评论图片',
            '评论时间',
            '点赞数',
            '子评论数',
            'IP地址',
            '一级评论ID',
            '引用的评论ID',
            '引用的用户ID',
            '引用的用户名称',
        ]];
        const getRow = (comment: http.comment.Comment | http.comment.ReplyComment): Array<any> => {
            const row = [];
            row.push(comment.cid);
            row.push(comment.aweme_id);
            row.push(`https://www.douyin.com/video/${comment.aweme_id}`);
            row.push(comment.user?.sec_uid);
            row.push(comment.user?.unique_id || comment.user?.short_id);
            row.push(comment.user?.nickname);
            row.push(`https://www.douyin.com/user/${comment.user?.sec_uid}`);
            row.push(comment.text);
            row.push(
                comment.image_list
                    ?.map((o) => o.origin_url.url_list.reverse()[0])
                    ?.join('\n'),
            );
            row.push(comment.create_time && new Date(comment.create_time * 1000));
            row.push(comment.digg_count);
            row.push(
                'reply_comment_total' in comment ? comment?.reply_comment_total : '-',
            );
            row.push(comment.ip_label);

            row.push(comment.reply_id != '0' ? comment.reply_id : '-');
            row.push(
                comment.reply_to_reply_id != '0' ? comment.reply_to_reply_id : '-',
            );
            row.push('reply_to_userid' in comment ? comment.reply_to_userid : '-');
            row.push(
                'reply_to_username' in comment ? comment.reply_to_username : '-',
            );
            return row;
        };
        for (const awemeId of postIds) {
            const comments = this.data[awemeId];
            if (!comments) continue;
            for (const comment of comments) {
                dataList.push(getRow(comment));
                if (comment.reply_comment?.length) {
                    for (const subComment of comment.reply_comment) {
                        dataList.push(getRow(subComment));
                    }
                }
            }
        }
        return [this.getExcelFileInfo(dataList, "抖音-视频评论导出")];
    }



    /**
     * 获取视频的评论
     * @param task 连接信息
     * @param awemeId 视频ID
     * @param limit 条数限制
     * @param completed 已抓取的数量
     */
    async getAwemeComments(
        awemeId: string,
        limit: number,
        completed: number = 0,
    ): Promise<http.comment.Comment[]> {
        let cursor = 0;
        const commentList: http.comment.Comment[] = [];
        // 获取一级评论
        while (true) {
            const commentPage = await this.request(http.comment.getCommentList, {
                aweme_id: awemeId,
                cursor: cursor,
                count: 20,
                item_type: 0,
            });
            // 增加评论数
            commentList.push(...commentPage.comments);
            cursor = commentPage.cursor;
            // 更新进度
            const count = this.getCommentCount(commentList);
            this.actions.setCompleted(completed + count);
            if (count >= limit) {
                // 已经够了
                return commentList;
            }
            if (!commentPage.has_more) {
                // 没有更多评论了
                break;
            }
        }
        // 一级评论不够，获取子评论
        const hasReplies = commentList.filter(
            (item) => item.reply_comment_total > 0,
        );
        for (const comment of hasReplies) {
            comment.reply_comment = [];
            let count = this.getCommentCount(commentList);
            this.actions.setCompleted(completed + count);
            comment.reply_comment = await this.getCommentReplies(
                awemeId,
                comment.cid,
                limit - count,
            );
            // 更新进度
            count = this.getCommentCount(commentList);
            this.actions.setCompleted(completed + count);
            if (count >= limit) {
                // 已经够了
                return commentList;
            }
        }
        return commentList;
    }

    /**
     * 获取视频评论的子评论
     * @param client 连接信息
     * @param awemeId 笔记ID
     * @param commentId 根评论ID
     * @param limit 条数限制
     */
    async getCommentReplies(
        awemeId: string,
        commentId: string,
        limit: number,
    ): Promise<http.comment.ReplyComment[]> {
        let cursor = 0;
        const commentReplies: http.comment.ReplyComment[] = [];
        while (true) {
            const commentPage = await this.request(http.comment.getCommentReplyList, {
                item_id: awemeId,
                comment_id: commentId,
                cursor: cursor,
                count: 20,
                item_type: 0,
            });
            commentReplies.push(...commentPage.comments);
            // 更新进度
            this.actions.setCompleted(prev => prev + commentPage.comments.length);
            if (commentReplies.length >= limit) {
                // 足够了
                break;
            }
            if (!commentPage.has_more) {
                // 没有更多评论了
                break;
            }
            cursor = commentPage.cursor;
        }
        return commentReplies;
    }

    getCommentCount = (comments: http.comment.Comment[]): number => {
        return comments
            .map((o) => o.reply_comment?.length ?? 0)
            .reduce((a, b) => a + b, comments.length);
    };
}