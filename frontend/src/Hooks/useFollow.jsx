import { useMutation, useQueryClient } from "@tanstack/react-query"
import toast from "react-hot-toast";


const useFollow = () => {
 const queryClient = useQueryClient();

 const {mutate:followUnfollow, isPending} = useMutation({
    mutationFn: async (userId) => {
     try {
       const res = await fetch(`/api/user/follow/${userId}`, {
        method: 'POST',
        headers: {
         'Content-Type': 'application/json',
        },
       });
       const data = await res.json();
       return data;
    }catch (error) {
        console.error(error).message;
        throw new Error(error.message);
    }
 },
 onSuccess: (data) => {
   Promise.all([
          queryClient.invalidateQueries({queryKey:["authUser"]}),
    queryClient.invalidateQueries({queryKey:['SuggestedUsers']})
   ])

    toast.success(data.message)
 },
 onError: () => {
    toast.error("Error in Follow or Unfollow")
 }
}
)

 return {followUnfollow, isPending}
}

export default useFollow