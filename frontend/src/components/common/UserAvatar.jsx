/*
|--------------------------------------------------------------------------
| USER AVATAR COMPONENT
|--------------------------------------------------------------------------
|
| A reusable component to display a user's avatar.
| Shows the profile picture if available, otherwise falls back to initials.
|
| Props:
|   user: object — user data containing name and avatar URL
|   size: string — tailwind class for width and height (e.g., "w-8 h-8")
|   fontSize: string — tailwind class for initials font size (e.g., "text-[11px]")
|   className: string — additional classes for the container
|
*/

export default function UserAvatar({ user, size = "w-8 h-8", fontSize = "text-[11px]", className = "" }) {
    const initials = user?.name ? user.name.slice(0, 2).toUpperCase() : "US";
    const avatar = user?.avatar;

    return (
        <div className={`${size} rounded-full overflow-hidden flex items-center justify-center shrink-0 shadow-sm ${className}`}>
            {avatar ? (
                <img
                    src={avatar}
                    alt={user?.name || "User"}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                        // Fallback to initials if image fails to load
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                    }}
                />
            ) : null}
            <div 
                className={`w-full h-full bg-gradient-to-tr from-purple-500 to-pink-500 items-center justify-center font-bold text-white uppercase ${fontSize}`}
                style={{ display: avatar ? 'none' : 'flex' }}
            >
                {initials}
            </div>
        </div>
    );
}
