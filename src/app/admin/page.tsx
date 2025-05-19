'use client';

import { useState, useEffect } from 'react';
import { api } from '~/trpc/react';
import { Loader2, Globe, Map, AlertTriangle, ShieldAlert } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card';
import { Skeleton } from '~/components/ui/skeleton';
import Link from 'next/link';
import { Button } from '~/components/ui/button';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

export default function AdminDashboard() {
  const router = useRouter();
  const { data: session, status: sessionStatus } = useSession();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [isCheckingAdmin, setIsCheckingAdmin] = useState(true);
  
  const { data: stats, isLoading, error } = api.admin.getDestinationStats.useQuery(undefined, {
    enabled: isAdmin === true // Only fetch stats if user is admin
  });
  
  useEffect(() => {
    async function checkAdminStatus() {
      if (sessionStatus === 'loading') return;
      
      console.log('Session status:', sessionStatus);
      console.log('Session user:', session?.user);
      
      if (!session?.user?.id) {
        router.push('/api/auth/signin?callbackUrl=/admin');
        return;
      }
      
      try {
        console.log('Checking admin status for user ID:', session.user.id);
        const response = await fetch(`/api/check-admin?userId=${session.user.id}`);
        const data = await response.json();
        
        console.log('Admin check API response:', data);
        setIsAdmin(data.isAdmin);
        
        if (!data.isAdmin) {
          // If not admin, redirect to home after a brief delay
          setTimeout(() => router.push('/'), 2000);
        }
      } catch (error) {
        console.error('Failed to check admin status:', error);
        setIsAdmin(false);
      } finally {
        setIsCheckingAdmin(false);
      }
    }
    
    checkAdminStatus();
  }, [session, sessionStatus, router]);
  
  if (sessionStatus === 'loading' || isCheckingAdmin) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh]">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Checking credentials...</p>
      </div>
    );
  }
  
  if (isAdmin === false) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center h-[70vh]">
        <ShieldAlert className="h-12 w-12 text-destructive mb-4" />
        <h1 className="text-2xl font-bold">Access Denied</h1>
        <p className="text-muted-foreground mt-2 mb-6">
          You don't have permission to access the admin dashboard.
        </p>
        <Button asChild>
          <Link href="/">Return to Homepage</Link>
        </Button>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <AlertTriangle className="h-12 w-12 text-destructive mb-4" />
        <h1 className="text-2xl font-bold">Error Loading Dashboard</h1>
        <p className="text-muted-foreground mt-2 mb-6">
          {error.message || "Failed to load dashboard data. Please try again."}
        </p>
        <Button asChild>
          <Link href="/">Return to Homepage</Link>
        </Button>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <Button asChild>
          <Link href="/admin/destinations/new">Add Destination</Link>
        </Button>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Total Destinations Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Destinations</CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <div className="text-2xl font-bold">{stats?.totalDestinations || 0}</div>
            )}
          </CardContent>
        </Card>
        
        {/* Games Played Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Top Destination</CardTitle>
            <Map className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-full" />
            ) : (
              <div>
                {stats?.topDestinations && stats.topDestinations.length > 0 ? (
                  <div>
                    <div className="text-2xl font-bold">
                      {stats?.topDestinations?.[0]?.city}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {stats?.topDestinations?.[0]?.country} ({stats?.topDestinations?.[0]?.gamesCount} games)
                    </p>
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground">No data available</div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Quick Links Card */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2">
            <Button asChild variant="outline" size="sm" className="justify-start">
              <Link href="/admin/destinations">
                <Globe className="mr-2 h-4 w-4" />
                Manage Destinations
              </Link>
            </Button>
            <Button asChild variant="outline" size="sm" className="justify-start">
              <Link href="/admin/destinations/new">
                <Globe className="mr-2 h-4 w-4" />
                Add New Destination
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
      
      {/* Top Destinations Table */}
      <Card>
        <CardHeader>
          <CardTitle>Top Destinations</CardTitle>
          <CardDescription>
            The most played destinations in your game.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
            </div>
          ) : (
            <div className="rounded-md border">
              <div className="grid grid-cols-3 border-b p-3 text-sm font-medium">
                <div>City</div>
                <div>Country</div>
                <div className="text-right">Games</div>
              </div>
              {stats?.topDestinations && stats.topDestinations.length > 0 ? (
                stats.topDestinations.map((dest) => (
                  <div key={dest.id} className="grid grid-cols-3 p-3 text-sm">
                    <div className="font-medium">{dest.city}</div>
                    <div className="text-muted-foreground">{dest.country}</div>
                    <div className="text-right">{dest.gamesCount}</div>
                  </div>
                ))
              ) : (
                <div className="p-3 text-center text-sm text-muted-foreground">
                  No destination data available
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 