import { Link } from "react-router-dom";
import LoadingSpinner from "../../components/common/LoadingSpinner";

import { IoSettingsOutline } from "react-icons/io5";
import { FaUser } from "react-icons/fa";
import { FaHeart } from "react-icons/fa6";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

const NotificationPage = () => {

	const queryClient = useQueryClient();

	const {data:notifications,isLoading} = useQuery({
		queryKey: ["notifications"],
		queryFn: async () => {
			try {
				const res = await fetch('/api/notification/get',{
					method: 'GET'
				});
				const data = await res.json();
				if(!res.ok) {
					throw new Error(data.error);
				}
				console.log(data);
				
				return data.notifications;
			} catch (error) {
				console.log(error.message);
				throw new Error(error.message);
			}
		},
		onError:(error) => {
			toast.error(error.message);
		}
	});
	const {mutate:deleteNotifications} = useMutation({
		mutationFn: async () => {
			try {
				const res = await fetch('/api/notification/del',{
					method: 'DELETE'
				})
				const data = await res.json();
				if(!res.ok) {
                    throw new Error(data.error);
                }
				return data.notifications;
			} catch (error) {
				console.log(error.message);
				throw new Error(error.message);
			}
		},
		onSuccess: () => {
			toast.success("All notifications deleted successfully.");
			queryClient.invalidateQueries({queryKey: ["notifications"]})
		},
		onError: (error) => {
			toast.error(error.message);
		}
	});

if(!notifications) return;

	return (
		<>
			<div className='flex-[4_4_0] border-l border-r border-gray-700 min-h-screen'>
				<div className='flex justify-between items-center p-4 border-b border-gray-700'>
					<p className='font-bold'>Notifications</p>
					<div className='dropdown '>
						<div tabIndex={0} role='button' className='m-1'>
							<IoSettingsOutline className='w-4' />
						</div>
						<ul
							tabIndex={0}
							className='dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52'
						>
							<li>
								<a onClick={deleteNotifications}>Delete all notifications</a>
							</li>
						</ul>
					</div>
				</div>
				{isLoading && (
					<div className='flex justify-center h-full items-center'>
						<LoadingSpinner size='lg' />
					</div>
				)}
				{notifications?.length === 0 && <div className='text-center p-4 font-bold'>No notifications 🤔</div>}
				{notifications?.map((notification) => (
					<div className='border-b border-gray-700' key={notification._id}>
						<div className='flex gap-2 p-4'>
							{notification.type === "Follow" && <FaUser className='w-7 h-7 text-primary' />}
							{notification.type === "Unfollow" && <FaUser className='w-7 h-7 text-red-500' />}
							{notification.type === "like" && <FaHeart className='w-7 h-7 text-red-500' />}
							<Link to={`/profile/${notification.from.username}`}>
								<div className='avatar'>
									<div className='w-8 rounded-full'>
										<img src={notification.from.profileImg || "/avatar-placeholder.png"} />
									</div>
								</div>
								<div className='flex gap-1'>
									<span className='font-bold'>@{notification.from.username}</span>{" "}
									{notification.type === "Follow" && "Followed you"}
									{notification.type === "Unfollow" && "Unfollowed you"}
									{notification.type === "like" && "Liked your post"}
								</div>
							</Link>
						</div>
					</div>
				))}
			</div>
		</>
	);
};
export default NotificationPage;