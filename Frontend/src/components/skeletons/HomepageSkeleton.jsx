const HomepageSkeleton = () => {
  return (
    <div className="flex flex-col w-full h-screen animate-pulse">
        
        {/* Navbar */}
        <div className="h-[50px] border-b-2 border-gray-100">

        </div>

        {/* Body */}
        <div className="flex w-full">
            
            {/* Sidebar */}
            <div className="flex-none items-center py-4 flex flex-col gap-6 w-[200px] h-full border-r-2 border-gray-100">
                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-gray-100 rounded-lg"></div>
                    <div className="w-[80px] h-4 bg-gray-100"></div>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-gray-100 rounded-lg"></div>
                    <div className="w-[80px] h-4 bg-gray-100"></div>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-gray-100 rounded-lg"></div>
                    <div className="w-[80px] h-4 bg-gray-100"></div>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-gray-100 rounded-lg"></div>
                    <div className="w-[80px] h-4 bg-gray-100"></div>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-gray-100 rounded-lg"></div>
                    <div className="w-[80px] h-4 bg-gray-100"></div>
                </div>
            </div>

            {/* Main */}
            <div className="flex flex-col flex-auto w-full h-full gap-12 p-4 overflow-hidden">

                {/* Filters */}
                <div className="flex w-full gap-4">
                    <div className="h-[30px] flex-none bg-gray-100 w-[150px]"></div>
                    <div className="h-[30px] flex-none bg-gray-100 w-[150px]"></div>
                    <div className="h-[30px] flex-none bg-gray-100 w-[150px]"></div>
                    <div className="h-[30px] flex-none bg-gray-100 w-[150px]"></div>
                    <div className="h-[30px] flex-none bg-gray-100 w-[150px]"></div>
                    <div className="h-[30px] flex-none bg-gray-100 w-[150px]"></div>
                    <div className="h-[30px] flex-none bg-gray-100 w-[150px]"></div>
                    <div className="h-[30px] flex-none bg-gray-100 w-[150px]"></div>
                </div>

                {/* Posts */}
                <div className="flex flex-wrap gap-8">
                    <div className="flex flex-col gap-4 w-[250px] p-4 border-2 border-gray-100 rounded-xl">
                        <div className="flex gap-2">
                            <div className="w-6 h-6 bg-gray-100 rounded-full"></div>
                            <div className="w-[100px] h-[20px] bg-gray-100"></div>
                        </div>
                        <div className="w-full h-[100px] bg-gray-100"></div>
                        <div className="w-full h-[10px] bg-gray-100"></div>
                        <div className="w-1/2 h-[10px] bg-gray-100"></div>
                    </div>
                    <div className="flex flex-col gap-4 w-[250px] p-4 border-2 border-gray-100 rounded-xl">
                        <div className="flex gap-2">
                            <div className="w-6 h-6 bg-gray-100 rounded-full"></div>
                            <div className="w-[100px] h-[20px] bg-gray-100"></div>
                        </div>
                        <div className="w-full h-[100px] bg-gray-100"></div>
                        <div className="w-full h-[10px] bg-gray-100"></div>
                        <div className="w-1/2 h-[10px] bg-gray-100"></div>
                    </div>
                    <div className="flex flex-col gap-4 w-[250px] p-4 border-2 border-gray-100 rounded-xl">
                        <div className="flex gap-2">
                            <div className="w-6 h-6 bg-gray-100 rounded-full"></div>
                            <div className="w-[100px] h-[20px] bg-gray-100"></div>
                        </div>
                        <div className="w-full h-[100px] bg-gray-100"></div>
                        <div className="w-full h-[10px] bg-gray-100"></div>
                        <div className="w-1/2 h-[10px] bg-gray-100"></div>
                    </div>
                    <div className="flex flex-col gap-4 w-[250px] p-4 border-2 border-gray-100 rounded-xl">
                        <div className="flex gap-2">
                            <div className="w-6 h-6 bg-gray-100 rounded-full"></div>
                            <div className="w-[100px] h-[20px] bg-gray-100"></div>
                        </div>
                        <div className="w-full h-[100px] bg-gray-100"></div>
                        <div className="w-full h-[10px] bg-gray-100"></div>
                        <div className="w-1/2 h-[10px] bg-gray-100"></div>
                    </div>
                </div>
            </div>
        </div>
    </div>
  )
}

export default HomepageSkeleton