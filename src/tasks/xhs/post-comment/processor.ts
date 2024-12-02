import { getCommentPage, getCommentSubPage } from "@/services/xhs/comment";
import type { Comment, SubComment } from "@/services/xhs/comment.d";
import { TaskFileInfo, TaskProcessor } from "@/tasks/processor";
import { FormSchema } from ".";
import { ParseUrlResult } from "../post/parse-url";

export class Processor extends TaskProcessor<FormSchema> {
    public data: Record<string, Comment[]> = {};

    private signal: AbortSignal | undefined;

    async execute(signal: AbortSignal) {
        this.signal = signal;
        const { urls, limitPerId } = this.condition;
        let total = urls.length * limitPerId;
        this.actions.setTotal(total);
        let completed = 0;
        this.actions.setCompleted(completed);
        for (const postParam of urls) {
            signal.throwIfAborted();
            const comments = await this.getNoteComments(postParam, limitPerId, completed);
            const count = this.getCommentCount(comments);
            total += count - limitPerId;
            completed += count;
            this.actions.setCompleted(completed);
            this.actions.setTotal(total);
            //将采集到的数据绑定在 data 上
            this.data[postParam.id] = comments;
        }
    }

    async getFileInfos(): Promise<Array<TaskFileInfo>> {
        const { urls } = this.condition;
        const dataList = [[
            '笔记链接',
            '笔记ID',
            '评论ID',
            '用户ID',
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
        const getRow = (comment: Comment | SubComment, url: ParseUrlResult): Array<any> => {
            const row = [];
            row.push(url.href);
            row.push(url.id);
            row.push(comment.id);
            row.push(comment.user_info?.user_id);
            row.push(comment.user_info?.nickname);
            row.push(
                `https://www.xiaohongshu.com/user/profile/${comment.user_info?.user_id}`,
            );
            row.push(comment.content);
            row.push(comment.pictures?.map((o) => o.url_default)?.join('\n'));
            row.push(comment.create_time && new Date(comment.create_time));
            row.push(comment.like_count);
            row.push(
                'sub_comment_count' in comment ? comment?.sub_comment_count : '-',
            );
            row.push(comment.ip_location);

            if ('target_comment' in comment) {
                row.push(comment.target_comment?.id);
                row.push(comment.target_comment?.user_info?.user_id);
                row.push(comment.target_comment?.user_info?.nickname);
            }
            return row;
        };
        for (const postParam of urls) {
            const comments = this.data[postParam.id];
            if (!comments) continue;
            for (const comment of comments) {
                dataList.push(getRow(comment, postParam));
                if (comment.sub_comments?.length) {
                    for (const subComment of comment.sub_comments) {
                        dataList.push(getRow(subComment, postParam));
                    }
                }
            }
        }
        return [this.getExcelFileInfo(dataList, "小红书-笔记评论导出")];
    }

    /**
     * 获取笔记的评论
     * @param noteId 笔记ID
     * @param limit 条数限制
     */
    async getNoteComments(
        postParam: ParseUrlResult,
        limit: number,
        completed: number = 0,
    ): Promise<Comment[]> {
        let cursor = '';
        const commentList: Comment[] = [];
        // 获取一级评论
        while (true) {
            this.signal?.throwIfAborted();
            const commentPage = await getCommentPage({
                note_id: postParam.id,
                xsec_token: postParam.token,
                cursor: cursor,
                top_comment_id: '',
                image_formats: 'jpg,webp,avif',
            });
            // 增加评论数
            commentList.push(...commentPage.comments);
            cursor = commentPage.cursor;
            // 更新进度
            let count = this.getCommentCount(commentList);
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
        const hasMoreSubComments = commentList.filter((item) => item.sub_comment_has_more);
        for (const comment of hasMoreSubComments) {
            const subComments = await this.getNoteSubComments(
                postParam,
                comment.id,
                comment.sub_comment_cursor,
                limit - this.getCommentCount(commentList),
            );
            comment.sub_comments.push(...subComments);
            if (this.getCommentCount(commentList) >= limit) {
                // 已经够了
                return commentList;
            }
        }
        return commentList;
    }

    /**
     * 获取笔记的子评论
     * @param postParam 笔记参数
     * @param rootCommentId 根评论ID
     * @param cursor 游标
     * @param limit 条数限制
     */
    async getNoteSubComments(
        postParam: ParseUrlResult,
        rootCommentId: string,
        cursor: string,
        limit: number,
    ): Promise<SubComment[]> {
        this.signal?.throwIfAborted();
        const subCommentList: SubComment[] = [];
        const commentPage = await getCommentSubPage({
            note_id: postParam.id,
            xsec_token: postParam.token,
            root_comment_id: rootCommentId,
            num: 10,
            cursor: cursor,
            image_formats: 'jpg,webp,avif',
            top_comment_id: '',
        });
        subCommentList.push(...commentPage.comments);
        const count = commentPage.comments.length;
        // 更新进度
        this.actions.setCompleted(prev => prev + count);
        if (count >= limit) {
            // 足够了
            return subCommentList;
        }
        if (!commentPage.has_more) {
            // 没有更多评论了
            return subCommentList;
        }
        // 继续获取其他子评论
        const list = await this.getNoteSubComments(
            postParam,
            rootCommentId,
            commentPage.cursor,
            limit - count,
        );
        subCommentList.push(...list);
        return subCommentList;
    }

    getCommentCount = (comments: Comment[]): number => {
        return comments
            .map((o) => o.sub_comments?.length ?? 0)
            .reduce((a, b) => a + b, comments.length);
    };
}