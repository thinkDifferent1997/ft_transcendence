type LoadingScreenProps =
{
    message?: string;
};

export default function LoadingScreen
(
    {
        message = "Loading questions...",
    }: LoadingScreenProps
)
{
    return (
        <div>
            <h1>{message}</h1>
        </div>
    );
}
