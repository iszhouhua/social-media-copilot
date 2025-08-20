import { TaskProcessor } from "@/utils/task";
import { unionBy } from "lodash";
import { FormSchema } from ".";
import { getCommentPage, getCommentSubPage } from "../../api/comment";
import { getCommentMedias } from "../../utils/media";
import { ParsePostUrlResult } from "../../utils/parse-url";

export class Processor extends TaskProcessor<FormSchema> {
    public mediaOptions = [{
        value: "image",
        label: "评论图片"
    }];

    async execute() {
        const { urls, limitPerId } = this.condition;
        let total = urls.length * limitPerId;
        this.actions.setTotal(total);
        let completed = 0;
        for (const postParam of urls) {
            const comments = await this.getNoteComments(postParam, limitPerId, completed);
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
        const { urls } = this.condition;
        const dataList = [[
            '评论ID',
            '笔记ID',
            '笔记链接',

            '用户ID',
            '用户链接',
            '用户名称',

            '评论内容',
            '评论时间',
            '点赞数',
            '子评论数',
            'IP地址',
            '一级评论ID',
        ]];
        const getRow = (comment: XhsAPI.Comment | XhsAPI.SubComment, url: ParsePostUrlResult, rootCommentId?: string): Array<any> => {
            const row = [];
            row.push(comment.id);
            row.push(url.id);
            row.push(url.href);

            row.push(comment.user_info?.user_id);
            row.push(
                `https://www.xiaohongshu.com/user/profile/${comment.user_info?.user_id}`,
            );
            row.push(comment.user_info?.nickname);

            row.push(comment.content);
            row.push(comment.create_time && new Date(comment.create_time));
            row.push(comment.like_count);
            row.push(
                'sub_comment_count' in comment ? comment?.sub_comment_count : null,
            );
            row.push(comment.ip_location);
            row.push(rootCommentId);
            return row;
        };
        const allComments = this.getCrawledComments();
        for (const comment of allComments) {
            const postParam = urls.find(o => o.id === comment?.note_id);
            if (!postParam) continue;
            dataList.push(getRow(comment, postParam));
            if (comment.sub_comments?.length) {
                for (const subComment of comment.sub_comments) {
                    dataList.push(getRow(subComment, postParam, comment.id));
                }
            }
        }
        return generateExcelDownloadOption(dataList, "小红书-批量导出笔记评论");
    }

    getMediaDownloadOptions(mediaTypes: string[]) {
        const list: TaskDownloadOption[] = [];
        const allComments = this.getCrawledComments();
        for (const comment of allComments) {
            const files = getCommentMedias(comment);
            list.push(...files);
            if (comment.sub_comments?.length) {
                for (const subComment of comment.sub_comments) {
                    list.push(...getCommentMedias(subComment));
                }
            }
        }
        return list;
    }

    /**
     * 获取笔记的评论
     * @param noteId 笔记ID
     * @param limit 条数限制
     */
    async getNoteComments(
        postParam: ParsePostUrlResult,
        limit: number,
        completed: number = 0,
    ): Promise<XhsAPI.Comment[]> {
        let cursor = '';
        const commentList: XhsAPI.Comment[] = [];
        // 获取一级评论
        while (true) {
            const commentPage = await this.next({
                func: getCommentPage,
                args: [{
                    note_id: postParam.id,
                    xsec_token: postParam.token,
                    cursor: cursor,
                    top_comment_id: '',
                    image_formats: 'jpg,webp,avif',
                }],
                key: `${postParam.id}:${cursor}`
            });
            if (!commentPage.comments?.length) break;
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
        postParam: ParsePostUrlResult,
        rootCommentId: string,
        cursor: string,
        limit: number,
    ): Promise<XhsAPI.SubComment[]> {
        const subCommentList: XhsAPI.SubComment[] = [];
        const commentPage = await this.next({
            func: getCommentSubPage,
            args: [{
                note_id: postParam.id,
                xsec_token: postParam.token,
                root_comment_id: rootCommentId,
                num: 10,
                cursor: cursor,
                image_formats: 'jpg,webp,avif',
                top_comment_id: '',
            }],
            key: `${postParam.id}:${rootCommentId}:${cursor}`
        });
        if (!commentPage.comments?.length) return subCommentList;
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

    getCommentCount = (comments: XhsAPI.Comment[]): number => {
        return comments
            .map((o) => o.sub_comments?.length ?? 0)
            .reduce((a, b) => a + b, comments.length);
    };

    getCrawledComments() {
        const allComments: XhsAPI.Comment[] = [];
        for (const url of this.condition.urls) {
            const keys = this.dataCache.keys().filter(key => key.startsWith(url.id));
            for (const key of keys) {
                const comments = this.dataCache.get(key)?.comments;
                if (!comments) continue;
                const nodes = key.split(':');
                if (nodes.length === 3) {
                    const comment = allComments.find(item => item.id === nodes[1]);
                    if (!comment) continue;
                    if (!comment.sub_comments) comment.sub_comments = [];
                    comment.sub_comments.push(...comments as XhsAPI.SubComment[]);
                    comment.sub_comments = unionBy(comment.sub_comments, 'id');
                } else {
                    allComments.push(...comments as XhsAPI.Comment[]);
                }
            }
        }
        return unionBy(allComments, 'id');
    }
}