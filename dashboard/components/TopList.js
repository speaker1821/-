export default function TopList({ videoTitle, thumbnail, videoUrl }) {
    return (
        <div className="border-b p-4 flex items-center">
            <img
                src={thumbnail}
                alt="Video thumbnail"
                className="h-8"
            />
            <p className="text-ellipsis overflow-hidden whitespace-nowrap m-2 flex-1">
                <a href={videoUrl} className="text">{videoTitle}</a>
            </p>
        </div>
    )
}