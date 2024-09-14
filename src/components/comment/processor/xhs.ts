import { FileInfo, TaskProcessor } from "@/components/task/types";
import { FormSchema } from "../batch-export-dialog";
import moment from "moment";
import { TaskState } from "@/components/task/useTask";
import type { Comment, SubComment } from "@/services/xhs/comment.d";
import XLSX from 'xlsx';
import { getCommentPage, getCommentSubPage } from "@/services/xhs/comment";

export class XhsProcessor implements TaskProcessor<FormSchema, Comment[]> {

    async execute(task: TaskState<FormSchema, Comment[]>) {
        const { postIds, limitPerId } = task.condition;
        let total = postIds.length * limitPerId;
        task.setTotal(total);
        let completed = 0;
        task.setCompleted(completed);
        const data: Record<string, any> = {};
        for (const noteId of postIds) {
            const comments = await this.getNoteComments(task, noteId, limitPerId, completed);
            const count = this.getCommentCount(comments);
            if (count >= limitPerId) {
                // 采多了，增加总数
                total += count - limitPerId;
            } else {
                // 采少了，减少总数
                total -= limitPerId - count;
            }
            completed += count;
            task.setCompleted(completed);
            task.setTotal(total);
            //将采集到的数据绑定在 data 上
            data[noteId] = comments;
        }
        task.setData(data);
    }

    async getFileInfos(task: TaskState<FormSchema, Comment[]>): Promise<Array<FileInfo>> {
        const { postIds } = task.condition;
        const dataList = [[
            '笔记ID',
            '笔记链接',
            '评论ID',
            '评论内容',
            '评论图片',
            '评论时间',
            '点赞数',
            '子评论数',
            '用户ID',
            '用户名称',
            '用户主页',
            'IP地址',
            '一级评论ID',
            '引用的评论ID',
            '引用的用户ID',
            '引用的用户名称',
        ]];
        const getRow = (comment: Comment | SubComment): Array<any> => {
            const row = [];
            row.push(comment.note_id);
            row.push(`https://www.xiaohongshu.com/explore/${comment.note_id}`);
            row.push(comment.id);
            row.push(comment.content);
            row.push(comment.pictures?.map((o) => o.url_default)?.join('\n'));
            row.push(comment.create_time && new Date(comment.create_time));
            row.push(comment.like_count);
            row.push(
                'sub_comment_count' in comment ? comment?.sub_comment_count : '-',
            );
            row.push(comment.user_info?.user_id);
            row.push(comment.user_info?.nickname);
            row.push(
                `https://www.xiaohongshu.com/user/profile/${comment.user_info?.user_id}`,
            );
            row.push(comment.ip_location);

            if ('target_comment' in comment) {
                row.push(comment.target_comment?.id);
                row.push(comment.target_comment?.user_info?.user_id);
                row.push(comment.target_comment?.user_info?.nickname);
            }
            return row;
        };
        for (const noteId of postIds) {
            const comments = task.data[noteId];
            if (!comments) continue;
            for (const comment of comments) {
                dataList.push(getRow(comment));
                if (comment.sub_comments?.length) {
                    for (const subComment of comment.sub_comments) {
                        dataList.push(getRow(subComment));
                    }
                }
            }
        }
        const workbook = XLSX.utils.book_new();
        const worksheet = XLSX.utils.sheet_new();
        XLSX.utils.book_append_sheet(workbook, worksheet);
        XLSX.utils.sheet_add_aoa(worksheet, dataList);
        return [
            {
                data: XLSX.writeXLSX(workbook, { type: "buffer" }),
                type: 'buffer',
                filename: `小红书-笔记评论导出-${moment().format(moment.HTML5_FMT.DATETIME_LOCAL)}.xlsx`,
            },
        ];
    }

    /**
     * 获取笔记的评论
     * @param noteId 笔记ID
     * @param limit 条数限制
     */
    async getNoteComments(
        task: TaskState<FormSchema, Comment[]>,
        noteId: string,
        limit: number,
        completed: number = 0,
    ): Promise<Comment[]> {
        let cursor = '';
        const commentList: Comment[] = [];
        // 获取一级评论
        while (true) {
            const commentPage = await task.request(getCommentPage, {
                note_id: noteId,
                cursor: cursor,
                top_comment_id: '',
                image_formats: 'jpg,webp,avif',
            });
            // 增加评论数
            commentList.push(...commentPage.comments);
            cursor = commentPage.cursor;
            // 更新进度
            let count = this.getCommentCount(commentList);
            task.setCompleted(completed + count);
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
                task,
                noteId,
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
        task: TaskState<FormSchema, Comment[]>,
        noteId: string,
        rootCommentId: string,
        cursor: string,
        limit: number,
    ): Promise<SubComment[]> {
        const subCommentList: SubComment[] = [];
        const commentPage = await task.request(getCommentSubPage, {
            note_id: noteId,
            root_comment_id: rootCommentId,
            num: 10,
            cursor: cursor,
            image_formats: 'jpg,webp,avif',
            top_comment_id: '',
        });
        subCommentList.push(...commentPage.comments);
        const count = commentPage.comments.length;
        // 更新进度
        task.setCompleted(prev => prev + count);
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
            task,
            noteId,
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