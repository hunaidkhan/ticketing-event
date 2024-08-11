const Layout = ({ children }: {children: React.ReactNode}) => {
    return (
        <div className=" w-screen animated-background h-screen bg-gradient-to-r from-emerald-200 via-lime-200 to-green-200">
            <div className="bg-dotted-pattern flex flex-center min-h-screen">
                {children}
            </div>
           
        </div>
    )
}

export default Layout