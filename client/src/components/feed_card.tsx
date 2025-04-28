import {Link} from "wouter";
import {useTranslation} from "react-i18next";
import {timeago} from "../utils/timeago";
import {HashTag} from "./hashtag";
import {useMemo} from "react";
import {useConfirm, useAlert} from "../components/dialog";
import {client} from "../main";
import {headersWithAuth} from "../utils/auth";

export function FeedCard({ id, title, avatar, draft, listed, top, summary, hashtags, createdAt, updatedAt }:
    {
        id: string, avatar?: string,
        draft?: number, listed?: number, top?: number,
        title: string, summary: string,
        hashtags: { id: number, name: string }[],
        createdAt: Date, updatedAt: Date
    }) {
    const { t } = useTranslation();
    const { showConfirm, ConfirmUI } = useConfirm();
    const { showAlert, AlertUI } = useAlert();

    const handleRemoveFromDraft = (e: React.MouseEvent) => {
        e.preventDefault(); // 防止触发Link的点击事件
        e.stopPropagation();
        
        showConfirm(
            t("remove_from_draft"),
            t("remove_from_draft.confirm"),
            () => {
                client.feed({ id: parseInt(id) }).post(
                    {
                        draft: false,
                        listed: true
                    },
                    {
                        headers: headersWithAuth(),
                    }
                ).then(({ error }) => {
                    if (error) {
                        showAlert(error.value as string);
                    } else {
                        showAlert(t("remove_from_draft.success"), () => {
                            window.location.reload();
                        });
                    }
                });
            }
        );
    };

    return useMemo(() => (
        <>
            <div className="relative w-full">
                <Link href={`/feed/${id}`} target="_blank" className="w-full rounded-2xl bg-w my-2 p-6 duration-300 bg-button block">
                    {avatar &&
                        <div className="flex flex-row items-center mb-2 rounded-xl overflow-clip">
                            <img src={avatar} alt=""
                                className="object-cover object-center w-full max-h-96 hover:scale-105 translation duration-300" />
                        </div>}
                    <div className="flex items-center justify-between">
                        <h1 className="text-xl font-bold text-gray-700 dark:text-white text-pretty overflow-hidden">
                            {title}
                        </h1>
                        {draft === 1 && (
                            <button
                                onClick={handleRemoveFromDraft}
                                className="ml-4 px-3 py-1 bg-green-100 text-green-800 text-xs rounded-md hover:bg-green-200 flex items-center"
                            >
                                <i className="ri-send-plane-fill mr-1"></i>
                                Publish
                            </button>
                        )}
                    </div>
                    <p className="space-x-2">
                        <span className="text-gray-400 text-sm" title={new Date(createdAt).toLocaleString()}>
                            {createdAt === updatedAt ? timeago(createdAt) : t('feed_card.published$time', { time: timeago(createdAt) })}
                        </span>
                        {createdAt !== updatedAt &&
                            <span className="text-gray-400 text-sm" title={new Date(updatedAt).toLocaleString()}>
                                {t('feed_card.updated$time', { time: timeago(updatedAt) })}
                            </span>
                        }
                    </p>
                    <p className="space-x-2">
                        {draft === 1 && <span className="text-gray-400 text-sm">{t("draft")}</span>}
                        {listed === 0 && <span className="text-gray-400 text-sm">{t("unlisted")}</span>}
                        {top === 1 && <span className="text-theme text-sm">
                            {t('article.top.title')}
                        </span>}
                    </p>
                    <p className="text-pretty overflow-hidden dark:text-neutral-500">
                        {summary}
                    </p>
                    {hashtags.length > 0 &&
                        <div className="mt-2 flex flex-row flex-wrap justify-start gap-x-2">
                            {hashtags.map(({ name }, index) => (
                                <HashTag key={index} name={name} />
                            ))}
                        </div>
                    }
                </Link>
            </div>
            <ConfirmUI />
            <AlertUI />
        </>
    ), [id, title, avatar, draft, listed, top, summary, hashtags, createdAt, updatedAt])
}