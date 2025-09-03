import { TaskProcessor } from "@/utils/task";
import { unionBy } from "lodash";
import { FormSchema } from ".";
import * as http from "../../api";
import { getCommentMedias } from "../../utils/media";

export class Processor extends TaskProcessor<FormSchema, DouyinAPI.AwemeV1WebComment | DouyinAPI.AwemeV1WebCommentReply> {
    public mediaOptions = [{
        value: "image",
        label: "评论图片"
    }];

    async execute() {
        const { urls, limitPerId } = this.condition;
        let total = urls.length * limitPerId;
        this.actions.setTotal(total);
        let completed = 0;
        for (const url of urls) {
            const comments = await this.getAwemeComments(url.id, limitPerId, completed);
            const count = this.getCommentCount(comments);
            total += count - limitPerId;
            completed += count;
            this.actions.setCompleted(completed);
            this.actions.setTotal(total);
        }
        const count = this.getCommentCount(this.getCrawledComments());
        this.actions.setCompleted(count);
        this.actions.setTotal(count);
    }


    getDataDownloadOption(): TaskDownloadOption {
        const dataList: any[][] = [[
            '评论ID',
            '视频ID',
            '视频链接',

            '用户UID',
            '用户链接',
            '抖音号',
            '用户名称',

            '评论内容',
            '评论时间',
            '点赞数',
            '子评论数',
            'IP地址',
            '一级评论ID',
        ]];
        const getRow = (comment: DouyinAPI.Comment | DouyinAPI.ReplyComment): Array<any> => {
            const row = [];
            row.push(comment.cid);
            row.push(comment.aweme_id);
            row.push(`https://www.douyin.com/video/${comment.aweme_id}`);

            row.push(comment.user?.uid);
            row.push(`https://www.douyin.com/user/${comment.user?.sec_uid}`);
            row.push(comment.user?.unique_id || comment.user?.short_id);
            row.push(comment.user?.nickname);

            row.push(comment.text);
            row.push(comment.create_time && new Date(comment.create_time * 1000));
            row.push(comment.digg_count);
            row.push(
                'reply_comment_total' in comment ? comment?.reply_comment_total : '-',
            );
            row.push(comment.ip_label);

            row.push(comment.reply_id != '0' ? comment.reply_id : '-');
            return row;
        };
        const allComments = this.getCrawledComments();
        for (const comment of allComments) {
            dataList.push(getRow(comment));
            if (comment.reply_comment?.length) {
                for (const subComment of comment.reply_comment) {
                    dataList.push(getRow(subComment));
                }
            }
        }
        return generateExcelDownloadOption(dataList, "抖音-批量导出视频评论");
    }

    getMediaDownloadOptions(mediaTypes: string[]) {
        const list: TaskDownloadOption[] = [];
        const allComments = this.getCrawledComments();
        for (const comment of allComments) {
            const files = getCommentMedias(comment);
            list.push(...files);
            if (comment.reply_comment?.length) {
                for (const subComment of comment.reply_comment) {
                    list.push(...getCommentMedias(subComment));
                }
            }
        }
        return list;
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
    ): Promise<DouyinAPI.Comment[]> {
        let cursor = 0;
        const commentList: DouyinAPI.Comment[] = [];
        // 获取一级评论
        while (true) {
            const commentPage = await this.next(
                {
                    key: `${awemeId}:${cursor}`,
                    func: http.comment.getCommentList,
                    args: [{
                        aweme_id: awemeId,
                        cursor: cursor,
                        count: 20,
                        item_type: 0,
                    }]
                });
            if (!commentPage.comments?.length) break;
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
     * @param awemeId 视频ID
     * @param commentId 根评论ID
     * @param limit 条数限制
     */
    async getCommentReplies(
        awemeId: string,
        commentId: string,
        limit: number,
    ): Promise<DouyinAPI.ReplyComment[]> {
        let cursor = 0;
        const commentReplies: DouyinAPI.ReplyComment[] = [];
        while (true) {
            const commentPage = await this.next({
                key: `${awemeId}:${commentId}:${cursor}`,
                func: http.comment.getCommentReplyList,
                args: [{
                    item_id: awemeId,
                    comment_id: commentId,
                    cursor: cursor,
                    count: 20,
                    item_type: 0,
                }]
            });
            if (!commentPage.comments?.length) break;
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

    getCommentCount = (comments: DouyinAPI.Comment[]): number => {
        return comments
            .map((o) => o.reply_comment?.length ?? 0)
            .reduce((a, b) => a + b, comments.length);
    };

    getCrawledComments() {
        const allComments: DouyinAPI.Comment[] = [];
        for (const url of this.condition.urls) {
            const keys = this.dataCache.keys().filter(key => key.startsWith(url.id));
            for (const key of keys) {
                const comments = this.dataCache.get(key)?.comments;
                if (!comments) continue;
                const nodes = key.split(':');
                if (nodes.length === 3) {
                    const comment = allComments.find(item => item.cid === nodes[1]);
                    if (!comment) continue;
                    if (!comment.reply_comment) comment.reply_comment = [];
                    comment.reply_comment.push(...comments as DouyinAPI.ReplyComment[]);
                    comment.reply_comment = unionBy(comment.reply_comment, 'cid');
                } else {
                    allComments.push(...comments as DouyinAPI.Comment[]);
                }
            }
        }
        return unionBy(allComments, 'cid');
    }
}