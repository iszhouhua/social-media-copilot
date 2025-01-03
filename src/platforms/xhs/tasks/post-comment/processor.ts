import { TaskFileInfo, TaskProcessor } from "@/components/task";
import { FormSchema } from ".";
import type { Comment, SubComment } from "@/platforms/xhs/http/comment.d";
import { getCommentPage, getCommentSubPage } from "@/platforms/xhs/http/comment";

export class Processor extends TaskProcessor<FormSchema, Comment[]> {

    async execute() {
        const { postParams, limitPerId } = this.condition;
        let total = postParams.length * limitPerId;
        this.actions.setTotal(total);
        let completed = 0;
        this.actions.setCompleted(completed);
        for (const postParam of postParams) {
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
        const { postParams, needMedia } = this.condition;
        const dataList = [[
            '评论ID',
            '笔记ID',
            '笔记链接',
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
        const medias: TaskFileInfo[] = [];
        const getRow = (comment: Comment | SubComment, postParam: {
            id: string;
            source: string;
            token: string;
        }): Array<any> => {
            const row = [];
            row.push(comment.id);
            row.push(comment.note_id);
            row.push(`https://www.xiaohongshu.com/explore/${comment.note_id}??xsec_token=${postParam.token}&xsec_source=${postParam.source}`);
            row.push(comment.user_info?.user_id);
            row.push(comment.user_info?.nickname);
            row.push(
                `https://www.xiaohongshu.com/user/profile/${comment.user_info?.user_id}`,
            );
            row.push(comment.content);
            row.push(comment.pictures?.map((o) => o.url_default)?.join('\n'));
            if (needMedia) {
                medias.push(...comment.pictures?.map((o,index) => {
                    const info: TaskFileInfo = {
                        filename: `${comment.id}-图${index+1}.png`,
                        type: "url",
                        data: o.url_default
                    }
                    return info;
                }) || []);
            }
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
        for (const postParam of postParams) {
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
        return [this.getExcelFileInfo(dataList, "小红书-笔记评论导出"), ...medias];
    }

    /**
     * 获取笔记的评论
     * @param noteId 笔记ID
     * @param limit 条数限制
     */
    async getNoteComments(
        postParam: {
            id: string;
            source: string;
            token: string;
        },
        limit: number,
        completed: number = 0,
    ): Promise<Comment[]> {
        let cursor = '';
        const commentList: Comment[] = [];
        // 获取一级评论
        while (true) {
            const commentPage = await this.request(getCommentPage, {
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
     * @param noteId 笔记ID
     * @param rootCommentId 根评论ID
     * @param cursor 游标
     * @param limit 条数限制
     */
    async getNoteSubComments(
        postParam: {
            id: string;
            source: string;
            token: string;
        },
        rootCommentId: string,
        cursor: string,
        limit: number,
    ): Promise<SubComment[]> {
        const subCommentList: SubComment[] = [];
        const commentPage = await this.request(getCommentSubPage, {
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